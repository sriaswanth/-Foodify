require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const ordersRoutes = require('./routes/orders');

const Menu = require('./models/Menu');
const runSeeder = require('./seed');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', ordersRoutes);

// Database Connection & Auto-Seeding
connectDB().then(async () => {
    try {
        const count = await Menu.countDocuments();
        if (count === 0) {
            console.log('Database is empty. Running Auto-Seeder...');
            await runSeeder();
            console.log('Auto-Seeding complete!');
        } else {
            console.log(`Database already has ${count} dishes. Skipping seed.`);
        }
    } catch (err) {
        console.error('Error during Auto-Seed check:', err);
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
