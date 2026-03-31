const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { items, totalAmount, deliveryAddress, useWallet } = req.body;
        
        if (!items || items.length === 0 || !totalAmount || !deliveryAddress) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        let finalAmount = totalAmount;
        let discountApplied = 0;

        // Apply Wallet Discount if requested
        const currentBalance = user.walletBalance || 0;
        if (useWallet && currentBalance > 0) {
            if (currentBalance >= totalAmount) {
                discountApplied = totalAmount;
                user.walletBalance = currentBalance - totalAmount;
                finalAmount = 0;
            } else {
                discountApplied = currentBalance;
                finalAmount = totalAmount - currentBalance;
                user.walletBalance = 0;
            }
        } else {
            // Ensure walletBalance is at least 0 if not using it
            user.walletBalance = currentBalance;
        }

        // Create Order
        const newOrder = new Order({
            user: req.user.id,
            items,
            totalAmount: finalAmount,
            deliveryAddress,
            paymentMethod: 'Cash on Delivery',
            status: 'Pending'
        });

        await newOrder.save();

        // 10% cashback on the ORIGINAL total amount (generous logic)
        const cashback = Math.floor(totalAmount * 0.1);
        
        // Use findByIdAndUpdate to ensure atomic and robust update
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $inc: { walletBalance: cashback - discountApplied } },
            { new: true }
        );

        res.status(201).json({ 
            message: 'Order placed successfully', 
            orderId: newOrder._id,
            discountApplied,
            finalAmount,
            cashbackEarned: cashback,
            newWalletBalance: updatedUser?.walletBalance || 0
        });
    } catch (err) {
        console.error('Error in POST /orders:', err);
        res.status(500).json({ error: 'Internal server error while placing order' });
    }
});

// Get user orders
router.get('/', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).populate('items.menuItem');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Mark order as received AND update favorites logic
router.put('/:id/receive', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (order.user.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

        if (order.status === 'Received') {
            return res.status(400).json({ error: 'Order already marked as received' });
        }

        order.status = 'Received';
        await order.save();

        const user = await User.findById(req.user.id);
        if (user) {
            order.items.forEach(item => {
                if (item.menuItem) {
                    const dishId = item.menuItem.toString();
                    const currentCount = user.dishOrderCounts.get(dishId) || 0;
                    const newCount = currentCount + 1;
                    user.dishOrderCounts.set(dishId, newCount);

                    if (newCount >= 3 && !user.favorites.includes(item.menuItem)) {
                        user.favorites.push(item.menuItem);
                    }
                }
            });
            await user.save();
        }
        
        res.json({ message: 'Order marked as received', order, favorites: user?.favorites || [] });
    } catch (err) {
        console.error('Error in PUT /receive:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
