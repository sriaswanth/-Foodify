const mongoose = require('mongoose');
const Menu = require('./models/Menu');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connection SUCCESS');
        
        // Seed database if empty
        const count = await Menu.countDocuments();
        if (count === 0) {
            await Menu.insertMany([
                { name: "Neon Double Cheeseburger", description: "A mouth-watering, gourmet double cheeseburger with secret sauce.", price: 14.99, imageUrl: "/burger.png" },
                { name: "Cyber Pepperoni Pizza", description: "Delicious pepperoni pizza with melting cheese and perfectly baked crust.", price: 18.99, imageUrl: "/pizza.png" },
                { name: "Midnight Sushi Platter", description: "Premium assorted sushi and sashimi, sleek modern plating.", price: 24.99, imageUrl: "/sushi.png" }
            ]);
            console.log("Menu database seeded with initial items.");
        }
    } catch (error) {
        console.error('MongoDB connection FAIL:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
