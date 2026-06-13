const express = require('express');
const router = express.Router();
const { 
  getPets, getPetsByCustomer, createPet, updatePet, deletePet 
} = require('../controllers/petController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getPets)
  .post(protect, createPet);

router.get('/customer/:customerId', protect, getPetsByCustomer);

router.route('/:id')
  .put(protect, updatePet)
  .delete(protect, adminOnly, deletePet);

module.exports = router;
