const express = require('express');
const router = express.Router();
const { 
  getCustomers, getCustomerById, searchCustomers, 
  createCustomer, updateCustomer, deleteCustomer 
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.get('/search', protect, searchCustomers);

router.route('/')
  .get(protect, getCustomers)
  .post(protect, createCustomer);

router.route('/:id')
  .get(protect, getCustomerById)
  .put(protect, updateCustomer)
  .delete(protect, adminOnly, deleteCustomer);

module.exports = router;
