const express = require('express');
const router = express.Router();
const { 
  getDashboardMetrics, getBestSelling, getPaymentMethods 
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardMetrics);
router.get('/best-selling', protect, getBestSelling);
router.get('/payment-methods', protect, getPaymentMethods);

module.exports = router;
