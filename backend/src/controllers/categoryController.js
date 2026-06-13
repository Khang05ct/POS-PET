const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  const [categories] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  res.status(200).json(categories);
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Name is required');
  }

  const [result] = await pool.query(
    'INSERT INTO categories (name, description) VALUES (?, ?)',
    [name, description]
  );

  res.status(201).json({
    id: result.insertId,
    name,
    description,
    status: 'ACTIVE'
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;
  const categoryId = req.params.id;

  const [category] = await pool.query('SELECT * FROM categories WHERE id = ?', [categoryId]);
  if (category.length === 0) {
    res.status(404);
    throw new Error('Category not found');
  }

  await pool.query(
    'UPDATE categories SET name = ?, description = ?, status = ? WHERE id = ?',
    [name, description, status, categoryId]
  );

  res.status(200).json({ message: 'Category updated successfully' });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;

  const [category] = await pool.query('SELECT * FROM categories WHERE id = ?', [categoryId]);
  if (category.length === 0) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Check if category has products
  const [products] = await pool.query('SELECT id FROM products WHERE category_id = ? LIMIT 1', [categoryId]);
  if (products.length > 0) {
    res.status(400);
    throw new Error('Cannot delete category with associated products. Please reassign them first.');
  }

  await pool.query('DELETE FROM categories WHERE id = ?', [categoryId]);
  res.status(200).json({ message: 'Category removed' });
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
