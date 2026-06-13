const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all pets
// @route   GET /api/pets
// @access  Private
const getPets = asyncHandler(async (req, res) => {
  const [pets] = await pool.query(`
    SELECT p.*, c.full_name as customer_name, c.phone as customer_phone
    FROM pets p
    JOIN customers c ON p.customer_id = c.id
    ORDER BY p.id DESC
  `);
  res.status(200).json(pets);
});

// @desc    Get pets by customer
// @route   GET /api/customers/:customerId/pets (handled in pet routes directly)
// @access  Private
const getPetsByCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const [pets] = await pool.query('SELECT * FROM pets WHERE customer_id = ? ORDER BY id DESC', [customerId]);
  res.status(200).json(pets);
});

// @desc    Create pet
// @route   POST /api/pets
// @access  Private
const createPet = asyncHandler(async (req, res) => {
  const { customer_id, name, species, breed, age, weight, gender, note } = req.body;

  if (!customer_id || !name) {
    res.status(400);
    throw new Error('Customer ID and name are required');
  }

  const [result] = await pool.query(
    'INSERT INTO pets (customer_id, name, species, breed, age, weight, gender, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [customer_id, name, species || null, breed || null, age || null, weight || null, gender || 'UNKNOWN', note || null]
  );

  res.status(201).json({
    id: result.insertId,
    message: 'Pet created successfully'
  });
});

// @desc    Update pet
// @route   PUT /api/pets/:id
// @access  Private
const updatePet = asyncHandler(async (req, res) => {
  const petId = req.params.id;
  const { name, species, breed, age, weight, gender, note } = req.body;

  const [pet] = await pool.query('SELECT * FROM pets WHERE id = ?', [petId]);
  if (pet.length === 0) {
    res.status(404);
    throw new Error('Pet not found');
  }

  await pool.query(
    'UPDATE pets SET name = ?, species = ?, breed = ?, age = ?, weight = ?, gender = ?, note = ? WHERE id = ?',
    [name, species || null, breed || null, age || null, weight || null, gender || 'UNKNOWN', note || null, petId]
  );

  res.status(200).json({ message: 'Pet updated successfully' });
});

// @desc    Delete pet
// @route   DELETE /api/pets/:id
// @access  Private/Admin
const deletePet = asyncHandler(async (req, res) => {
  const petId = req.params.id;

  const [pet] = await pool.query('SELECT * FROM pets WHERE id = ?', [petId]);
  if (pet.length === 0) {
    res.status(404);
    throw new Error('Pet not found');
  }

  await pool.query('DELETE FROM pets WHERE id = ?', [petId]);
  res.status(200).json({ message: 'Pet removed' });
});

module.exports = {
  getPets,
  getPetsByCustomer,
  createPet,
  updatePet,
  deletePet
};
