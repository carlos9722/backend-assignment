require('dotenv').config();
const express = require('express');
const app = express();
const productRoutes = require('./src/routes/product.routes');
const orderRoutes = require('./src/routes/order.routes');

app.use(express.json());
app.use(productRoutes);
app.use(orderRoutes);

app.get('/health', (req, res) => res.send('Orders API OK'));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`🚀 Orders API running on port ${PORT}`));
