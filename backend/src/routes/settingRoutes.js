const express = require('express');
const router = express.Router();
const { 
  getSettings, updateSettings, updateStoreStatus 
} = require('../controllers/settingController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getSettings)
  .put(protect, adminOnly, updateSettings);

router.put('/store-status', protect, adminOnly, updateStoreStatus);

module.exports = router;
