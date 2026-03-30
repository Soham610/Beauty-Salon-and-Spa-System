require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const createCrudController = require('./controllers/createCrudController');
const appointmentController = require('./controllers/appointmentController');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const createResourceRouter = require('./routes/createResourceRouter');
const requireAuth = require('./middleware/authMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');
const { modules } = require('./config/modules');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'beauty-salon-demo-secret',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/health', (req, res) => {
  res.json({ message: 'Beauty and Salon Management System is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api', requireAuth);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admins', createResourceRouter(createCrudController(modules.admins)));
app.use('/api/users', createResourceRouter(createCrudController(modules.users)));
app.use('/api/categories', createResourceRouter(createCrudController(modules.categories)));
app.use('/api/services', createResourceRouter(createCrudController(modules.services)));
app.use('/api/settings', createResourceRouter(createCrudController(modules.settings)));
app.use('/api/appointments', createResourceRouter(appointmentController));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.use(errorMiddleware);

module.exports = app;
