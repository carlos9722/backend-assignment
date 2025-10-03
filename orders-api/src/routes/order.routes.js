const express = require('express');
const router = express.Router();
const controller = require('../controllers/order.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/orders', authenticate, controller.createOrder);
router.post('/orders/:id/confirm', authenticate, controller.confirmOrder);
router.post('/orders/:id/cancel', authenticate, controller.cancelOrder);
router.get('/orders/:id', authenticate, controller.getOrder);

module.exports = router;
