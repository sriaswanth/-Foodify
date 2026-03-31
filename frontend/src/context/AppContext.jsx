import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [cart, setCart] = useState([]);
    
    // Load user on startup if token exists
    useEffect(() => {
        if (token) {
            const savedUser = localStorage.getItem('user');
            if (savedUser) setUser(JSON.parse(savedUser));
            refreshUser();
        }
    }, [token]);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const refreshUser = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data && !data.error) {
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
            }
        } catch (err) {
            console.error("Error refreshing user:", err);
        }
    };

    const login = (userData, jwtToken) => {
        setToken(jwtToken);
        setUser(userData);
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setCart([]);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const updateFavorites = (newFavorites) => {
        if (user) {
            const updatedUser = { ...user, favorites: newFavorites };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    const updateWallet = (newBalance) => {
        if (user) {
            const updatedUser = { ...user, walletBalance: newBalance };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    const addToCart = (item) => {
        setCart(prev => {
            const existingItem = prev.find(i => i._id === item._id);
            if (existingItem) {
                return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(i => i._id !== itemId));
    };

    const clearCart = () => setCart([]);

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <AppContext.Provider value={{
            user, token, login, logout, updateFavorites, updateWallet, refreshUser,
            cart, addToCart, removeFromCart, clearCart, getCartTotal
        }}>
            {children}
        </AppContext.Provider>
    );
};
