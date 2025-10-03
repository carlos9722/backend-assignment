const { z } = require('zod');

const createCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
});

module.exports = { createCustomerSchema };
