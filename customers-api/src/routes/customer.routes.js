const express = require('express');
const router = express.Router();
const controller = require('../controllers/customer.controller');
const { authenticate, serviceAuth } = require('../middlewares/auth.middleware');

router.post('/customers', authenticate, controller.createCustomer);
router.get('/customers/:id', authenticate, controller.getCustomerById);

// Ruta interna para Orders API
router.get('/internal/customers/:id', serviceAuth, controller.getCustomerInternal);

module.exports = router;
