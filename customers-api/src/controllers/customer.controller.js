const pool = require('../utils/objectConnections');
const { createCustomerSchema } = require('../validations/customer.schema');

async function createCustomer(req, res) {
  try {
    const { name, email, phone } = createCustomerSchema.parse(req.body);
    const [result] = await pool.execute(
      'INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)',
      [name, email, phone]
    );
    res.status(201).json({ id: result.insertId, name, email, phone });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function getCustomerById(req, res) {
  const [rows] = await pool.execute('SELECT * FROM customers WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
  res.json(rows[0]);
}

async function getCustomerInternal(req, res) {
  const [rows] = await pool.execute('SELECT * FROM customers WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
  res.json(rows[0]);
}

module.exports = {
  createCustomer,
  getCustomerById,
  getCustomerInternal,
};
