const express = require('express');
const router = express.Router();
const controller = require('../controllers/product.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/products', authenticate, controller.createProduct);
router.patch('/products/:id', authenticate, controller.updateProduct);
router.get('/products/:id', authenticate, controller.getProduct);
router.get('/products', authenticate, controller.listProducts);

module.exports = router;
