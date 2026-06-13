const express = require('express');
const router = express.Router();
const { 
  getInventoryHistory, importInventory, adjustInventory 
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.get('/history', protect, adminOnly, getInventoryHistory);
router.post('/import', protect, adminOnly, importInventory);
router.post('/adjust', protect, adminOnly, adjustInventory);

module.exports = router;
