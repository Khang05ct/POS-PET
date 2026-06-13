const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get store settings
// @route   GET /api/settings
// @access  Private
const getSettings = asyncHandler(async (req, res) => {
  const [settings] = await pool.query('SELECT * FROM store_settings LIMIT 1');
  
  if (settings.length === 0) {
    // Should have been seeded, but fallback
    res.status(200).json({
      store_name: 'PetCare Store',
      store_status: 'OPEN'
    });
    return;
  }
  
  res.status(200).json(settings[0]);
});

// @desc    Update store settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
  const { 
    store_name, address, phone, email, 
    bank_name, bank_account, bank_owner, invoice_footer, store_status 
  } = req.body;

  const [settings] = await pool.query('SELECT id FROM store_settings LIMIT 1');
  
  if (settings.length === 0) {
    await pool.query(
      `INSERT INTO store_settings 
      (store_name, address, phone, email, bank_name, bank_account, bank_owner, invoice_footer, store_status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [store_name, address, phone, email, bank_name, bank_account, bank_owner, invoice_footer, store_status]
    );
  } else {
    await pool.query(
      `UPDATE store_settings SET 
      store_name = ?, address = ?, phone = ?, email = ?, 
      bank_name = ?, bank_account = ?, bank_owner = ?, invoice_footer = ?, store_status = ? 
      WHERE id = ?`,
      [store_name, address, phone, email, bank_name, bank_account, bank_owner, invoice_footer, store_status, settings[0].id]
    );
  }

  req.io.emit('store-status:update', { status: store_status });

  res.status(200).json({ message: 'Settings updated successfully' });
});

// @desc    Update store status quickly
// @route   PUT /api/settings/store-status
// @access  Private/Admin
const updateStoreStatus = asyncHandler(async (req, res) => {
  const { store_status } = req.body;

  await pool.query('UPDATE store_settings SET store_status = ?', [store_status]);

  req.io.emit('store-status:update', { status: store_status });

  res.status(200).json({ message: 'Store status updated' });
});

module.exports = {
  getSettings,
  updateSettings,
  updateStoreStatus
};
