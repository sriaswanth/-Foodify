const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    category: { type: String, required: true, default: 'Other' },
    restaurantName: { type: String, required: true, default: 'Neon Kitchen' }
});

module.exports = mongoose.model('Menu', menuSchema);
