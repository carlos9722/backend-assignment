const pool = require('../utils/objectConnections');
const { createOrderSchema } = require('../validations/order.schema');
const axios = require('axios');

async function createOrder(req, res) {
  try {
    const { customer_id, items } = createOrderSchema.parse(req.body);

    await axios.get(`${process.env.CUSTOMERS_API_BASE}/internal/customers/${customer_id}`, {
      headers: { Authorization: `Bearer ${process.env.SERVICE_TOKEN}` }
    });

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const [rows] = await conn.execute('SELECT * FROM products WHERE id = ?', [item.product_id]);
      if (rows.length === 0) throw new Error('Product not found');
      const product = rows[0];
      if (product.stock < item.qty) throw new Error('Not enough stock');

      const subtotal = product.price_cents * item.qty;
      total += subtotal;

      await conn.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [item.qty, item.product_id]);

      orderItems.push({
        product_id: item.product_id,
        qty: item.qty,
        unit_price_cents: product.price_cents,
        subtotal_cents: subtotal
      });
    }

    const [orderResult] = await conn.execute(
      'INSERT INTO orders (customer_id, status, total_cents) VALUES (?, "CREATED", ?)',
      [customer_id, total]
    );

    const orderId = orderResult.insertId;

    for (const item of orderItems) {
      await conn.execute(
        'INSERT INTO order_items (order_id, product_id, qty, unit_price_cents, subtotal_cents) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.qty, item.unit_price_cents, item.subtotal_cents]
      );
    }

    await conn.commit();
    res.status(201).json({ id: orderId, status: 'CREATED', total_cents: total, items: orderItems });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function confirmOrder(req, res) {
  const { id } = req.params;
  const idempotencyKey = req.headers['x-idempotency-key'];

  if (!idempotencyKey) return res.status(400).json({ error: 'Idempotency key required' });

  const [existing] = await pool.execute('SELECT * FROM idempotency_keys WHERE `key` = ?', [idempotencyKey]);
  if (existing.length > 0) {
    return res.status(200).json(existing[0].response_body);
  }

  await pool.execute('UPDATE orders SET status = "CONFIRMED" WHERE id = ?', [id]);

  const [orderRows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [id]);
  const [items] = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [id]);

  const response = {
    id: orderRows[0].id,
    status: 'CONFIRMED',
    total_cents: orderRows[0].total_cents,
    items
  };

  await pool.execute(
    'INSERT INTO idempotency_keys (`key`, target_type, target_id, status, response_body, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
    [idempotencyKey, 'order_confirmation', id, 'completed', JSON.stringify(response)]
  );

  res.json(response);
}

async function cancelOrder(req, res) {
  const { id } = req.params;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [orderRows] = await conn.execute('SELECT * FROM orders WHERE id = ? FOR UPDATE', [id]);
    if (orderRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderRows[0];

    if (order.status === 'CANCELED') {
      await conn.commit();
      return res.status(200).json({ id: order.id, status: 'CANCELED', message: 'Already canceled' });
    }

    if (order.status === 'CONFIRMED') {
      const createdAt = new Date(order.created_at);
      const now = new Date();
      const diffMinutes = (now - createdAt) / 1000 / 60;

      if (diffMinutes > 10) {
        await conn.rollback();
        return res.status(400).json({ error: 'Too late to cancel confirmed order (> 10 mins)' });
      }
    }

    const [items] = await conn.execute('SELECT * FROM order_items WHERE order_id = ?', [id]);
    for (const item of items) {
      await conn.execute(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        [item.qty, item.product_id]
      );
    }

    await conn.execute('UPDATE orders SET status = "CANCELED" WHERE id = ?', [id]);

    await conn.commit();
    res.status(200).json({ id: order.id, status: 'CANCELED', restored: items.length });
  } catch (err) {
    await conn.rollback();
    console.error('Error canceling order:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    conn.release();
  }
}


async function getOrder(req, res) {
  const { id } = req.params;
  const [orderRows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [id]);
  if (orderRows.length === 0) return res.status(404).json({ error: 'Order not found' });

  const [items] = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [id]);
  res.json({ ...orderRows[0], items });
}

module.exports = {
  createOrder,
  confirmOrder,
  cancelOrder,
  getOrder
};
