const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');

router.get('/', async (req, res) => {
    try {
        const menus = await Menu.find({});
        res.json(menus);
    } catch (err) {
        console.error('Menu Fetch Failure:', err);
        res.status(500).json({ error: 'Internal server error while fetching menu', details: err.message });
    }
});

module.exports = router;
