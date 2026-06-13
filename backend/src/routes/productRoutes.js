const express = require('express');
const router = express.Router();
const { 
  getProducts, getProductById, searchProducts, 
  getProductByBarcode, getLowStockProducts, 
  createProduct, updateProduct, deleteProduct 
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.get('/search', protect, searchProducts);
router.get('/barcode/:barcode', protect, getProductByBarcode);
router.get('/low-stock', protect, getLowStockProducts);

router.route('/')
  .get(protect, getProducts)
  .post(protect, adminOnly, createProduct);

router.route('/:id')
  .get(protect, getProductById)
  .put(protect, adminOnly, updateProduct)
  .delete(protect, adminOnly, deleteProduct);

module.exports = router;
