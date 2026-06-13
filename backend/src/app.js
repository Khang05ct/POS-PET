const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorMiddleware } = require('./middleware/errorMiddleware');

// Routes imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const petRoutes = require('./routes/petRoutes');
const orderRoutes = require('./routes/orderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingRoutes = require('./routes/settingRoutes');

const createApp = (io) => {
  const app = express();

  // Middleware
  app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Attach socket.io to req for use in controllers
  app.use((req, res, next) => {
    req.io = io;
    next();
  });

  // Basic route for testing
  app.get('/', (req, res) => {
    res.send('PetCare POS API is running');
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/pets', petRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/settings', settingRoutes);

  // Error handling middleware
  app.use(errorMiddleware);

  return app;
};

module.exports = createApp;
