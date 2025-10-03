require('dotenv').config();
const express = require('express');
const app = express();
const customerRoutes = require('./src/routes/customer.routes');

app.use(express.json());
app.use(customerRoutes);

app.get('/health', (req, res) => res.send('Customers API OK'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Customers API running on port ${PORT}`));
