import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Favorites = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart, user } = useContext(AppContext);

    useEffect(() => {
        // We fetch all menu items and then filter by favorites in the frontend
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        fetch(`${API_BASE}/api/menu`)
            .then(res => res.json())
            .then(data => {
                setMenuItems(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching menu:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="container page" style={{ textAlign: 'center' }}><h2>Loading Favorites...</h2></div>;

    if (!user) {
        return <div className="container page" style={{ textAlign: 'center' }}><h2>Please login to view your favorites.</h2></div>;
    }

    const favoriteItems = menuItems.filter(item => user.favorites?.includes(item._id));

    return (
        <div className="container page">
            <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '10px', textAlign: 'center' }}>FOODIFY FAVORITES</h1>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '40px' }}>Your most-loved cyber-dishes, automatically tracked for you.</p>

            {favoriteItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Heart size={80} color="var(--glass-border)" style={{ marginBottom: '20px' }} />
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>No favorite dishes yet.</h3>
                    <Link to="/" className="btn btn-primary">Discover Food</Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                    {favoriteItems.map(item => (
                        <MenuCard key={item._id} item={item} addToCart={addToCart} isFavorite={true} />
                    ))}
                </div>
            )}
        </div>
    );
};

// Reusable MenuCard (consistent with Home.jsx)
const MenuCard = ({ item, addToCart, isFavorite }) => {
    const [imgLoading, setImgLoading] = useState(true);

    return (
        <div className="glass-panel" style={{ overflow: 'hidden', paddingBottom: '20px', transition: 'transform 0.3s', position: 'relative' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 10, background: 'rgba(0, 240, 255, 0.2)', backdropFilter: 'blur(5px)', borderRadius: '50%', padding: '8px', border: '1px solid var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={20} fill="var(--primary-blue)" color="var(--primary-blue)" />
            </div>
            
            <div style={{ width: '100%', height: '250px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000' }}>
                {imgLoading && <div className="spinner"></div>}
                <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    onLoad={() => setImgLoading(false)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: imgLoading ? 'none' : 'block' }}
                />
            </div>
            <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '10px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--primary-blue)', fontWeight: 600, letterSpacing: '1px' }}>{item.restaurantName?.toUpperCase() || 'FOODIFY'}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ fontSize: '1.4rem' }}>{item.name}</h3>
                        {item.category && <span style={{ fontSize: '0.8rem', padding: '4px 8px', background: 'var(--glass-border)', borderRadius: '10px', color: 'var(--text-muted)' }}>{item.category}</span>}
                    </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5', minHeight: '60px' }}>{item.description}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-blue)' }}>₹{item.price}</span>
                    <button className="btn btn-primary" onClick={() => addToCart(item)}>
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Favorites;
