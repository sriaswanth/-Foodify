require('dotenv').config();
const mongoose = require('mongoose');
const Menu = require('./models/Menu');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');
    } catch (error) {
        console.error('Connection failed:', error.message);
        process.exit(1);
    }
};

const restaurants = [
    'Neon Spice Garden', 'The Blue Lotus', 'Cyber Kitchen', 'Vibrant Bites',
    'Midnight Curry House', 'The Pasta Factory', 'Great Wall Palace', 'Glow Sushi Bar',
    'Urban Tadka', 'Velvet Vanilla', 'The Grill Master', 'Street Soul Food',
    'Infinity Flavors', 'Neon Zen Eatery', 'Cuisine de India'
];

const fetchMealsByArea = async (area) => {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`);
        const data = await response.json();
        return (data.meals || []).map(m => ({ ...m, category: area }));
    } catch (err) {
        console.error(`Failed to fetch ${area}:`, err);
        return [];
    }
};

const fetchMealsByCategory = async (category) => {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
        const data = await response.json();
        return (data.meals || []).map(m => ({ ...m, category }));
    } catch (err) {
        console.error(`Failed to fetch ${category}:`, err);
        return [];
    }
};

const runSeeder = async () => {
    await connectDB();
    
    await Menu.deleteMany();
    console.log('Cleared existing menu.');

    const areas = ['Indian', 'Italian', 'Chinese', 'Mexican', 'Japanese', 'American'];
    const categories = ['Seafood', 'Pasta', 'Chicken', 'Dessert'];
    
    let allMeals = [];

    // Fetch Areas
    for (const area of areas) {
        const meals = await fetchMealsByArea(area);
        allMeals = [...allMeals, ...meals];
        console.log(`Fetched ${meals.length} meals for Area: ${area}`);
    }

    // Fetch Categories
    for (const cat of categories) {
        const meals = await fetchMealsByCategory(cat);
        allMeals = [...allMeals, ...meals];
        console.log(`Fetched ${meals.length} meals for Category: ${cat}`);
    }

    // Process and insert
    const documents = allMeals.filter((meal, index, self) => 
        index === self.findIndex((t) => t.idMeal === meal.idMeal)
    ).map(meal => {
        // Randomly pick a restaurant name
        const restaurantName = restaurants[Math.floor(Math.random() * restaurants.length)];
        
        // Updated prices to INR-friendly range: 250 to 1800 INR
        const randomPrice = Math.floor(Math.random() * (1800 - 250 + 1)) + 250;
        return {
            name: meal.strMeal,
            description: `A delicious ${meal.category} dish: ${meal.strMeal}. Prepared with authentic recipes and fresh ingredients.`,
            price: randomPrice,
            imageUrl: meal.strMealThumb,
            category: meal.category,
            restaurantName: restaurantName
        };
    });

    if (documents.length > 0) {
        await Menu.insertMany(documents);
        console.log(`\nSuccessfully seeded ${documents.length} unique dishes with restaurant names.`);
    }

    mongoose.connection.close();
};

runSeeder();
