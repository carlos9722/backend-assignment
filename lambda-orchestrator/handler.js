require('dotenv').config();
const axios = require('axios');

const {
  CUSTOMERS_API_BASE,
  ORDERS_API_BASE,
  SERVICE_TOKEN
} = process.env;

module.exports.createAndConfirmOrder = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { customer_id, items, idempotency_key, correlation_id } = body;

    // ✅ 1. Recuperar el token JWT desde los headers de la request entrante
    const jwtToken = event.headers.Authorization?.split(' ')[1];

    if (!jwtToken) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Authorization token missing in headers' })
      };
    }

    // ✅ 2. Validar cliente con SERVICE_TOKEN
    const customerRes = await axios.get(`${CUSTOMERS_API_BASE}/internal/customers/${customer_id}`, {
      headers: {
        Authorization: `Bearer ${SERVICE_TOKEN}`
      }
    });

    const customer = customerRes.data;

    // ✅ 3. Crear orden
    const orderRes = await axios.post(`${ORDERS_API_BASE}/orders`, {
      customer_id,
      items
    }, {
      headers: {
        Authorization: `Bearer ${jwtToken}`
      }
    });

    const order = orderRes.data;

    // ✅ 4. Confirmar orden
    const confirmRes = await axios.post(`${ORDERS_API_BASE}/orders/${order.id}/confirm`, {}, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'X-Idempotency-Key': idempotency_key
      }
    });

    const confirmedOrder = confirmRes.data;

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        correlationId: correlation_id,
        data: {
          customer,
          order: confirmedOrder
        }
      })
    };

  } catch (err) {
    console.error('[Lambda Error]', err.response?.data || err.message);
    return {
      statusCode: err.response?.status || 500,
      body: JSON.stringify({ error: err.response?.data?.error || err.message })
    };
  }
};
