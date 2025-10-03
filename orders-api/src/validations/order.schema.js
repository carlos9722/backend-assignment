const { z } = require('zod');

const createOrderSchema = z.object({
  customer_id: z.number(),
  items: z.array(z.object({
    product_id: z.number(),
    qty: z.number().min(1),
  }))
});

module.exports = { createOrderSchema };
