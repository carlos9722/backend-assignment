const pool = require('../utils/objectConnections');

async function createProduct(req, res) {
  const { sku, name, price_cents, stock } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO products (sku, name, price_cents, stock) VALUES (?, ?, ?, ?)',
      [sku, name, price_cents, stock]
    );
    res.status(201).json({ id: result.insertId, sku, name, price_cents, stock });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function updateProduct(req, res) {
  const { id } = req.params;
  const { price_cents, stock } = req.body;
  await pool.execute(
    'UPDATE products SET price_cents = ?, stock = ? WHERE id = ?',
    [price_cents, stock, id]
  );
  res.json({ message: 'Product updated' });
}

async function getProduct(req, res) {
  const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
}

async function listProducts(req, res) {
  const [rows] = await pool.execute('SELECT * FROM products');
  res.json(rows);
}

module.exports = {
  createProduct,
  updateProduct,
  getProduct,
  listProducts
};
