import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Heart, MapPin, Search, Star, Zap, Flame } from 'lucide-react';

const Home = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [pastOrders, setPastOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedRestaurant, setSelectedRestaurant] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const { addToCart, user, token } = useContext(AppContext);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/menu`);
                const data = await res.json();
                
                // Add star ratings and "Chef's Special" flag (randomly for specific items)
                const itemWithExtras = data.map((item, index) => ({
                    ...item,
                    rating: (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1),
                    reviews: Math.floor(Math.random() * 200) + 50,
                    isChefSpecial: index % 15 === 0 // Every 15th item is a special
                }));
                setMenuItems(itemWithExtras);
                
                // Fetch past orders if logged in
                if (token) {
                    const orderRes = await fetch(`${API_BASE}/api/orders`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const orderData = await orderRes.json();
                    setPastOrders(orderData);
                }
                
                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    if (loading) return <div className="container page" style={{ textAlign: 'center' }}><h2>Loading Cyber Menu...</h2></div>;

    // Get unique items from past orders for "Buy It Again" shelf
    const reorderItems = [];
    if (pastOrders.length > 0) {
        const uniqueIds = new Set();
        pastOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.menuItem && !uniqueIds.has(item.menuItem._id)) {
                    uniqueIds.add(item.menuItem._id);
                    const originalMenuItem = menuItems.find(m => m._id === item.menuItem._id);
                    if (originalMenuItem) reorderItems.push(originalMenuItem);
                }
            });
        });
    }

    const categories = ['All', ...new Set(menuItems.map(item => item.category))].filter(Boolean);
    const restaurants = ['All', ...new Set(menuItems.map(item => item.restaurantName))].filter(Boolean);
    
    // Filter items based on Category, Restaurant, AND Search Query
    const filteredItems = menuItems.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesRestaurant = selectedRestaurant === 'All' || item.restaurantName === selectedRestaurant;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesRestaurant && matchesSearch;
    });

    // Sort to show favorites first
    const sortedItems = [...filteredItems].sort((a, b) => {
        const aFav = user?.favorites?.includes(a._id);
        const bFav = user?.favorites?.includes(b._id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return 0;
    });

    return (
        <div className="container page">
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 className="text-gradient" style={{ fontSize: '4rem', marginBottom: '10px' }}>FOODIFY</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Premium Cyber-Dining Experience. Delivered Instantly.</p>
            </div>

            {/* Premium Search Bar */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px' }}>
                <div className="glass-panel" style={{ width: '100%', maxWidth: '700px', display: 'flex', alignItems: 'center', padding: '5px 20px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                    <Search color="var(--primary-blue)" size={24} />
                    <input 
                        type="text" 
                        placeholder="Search for your favorite cyber-cravings..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ border: 'none', background: 'transparent', marginBottom: 0, paddingLeft: '15px', height: '50px', fontSize: '1.1rem' }}
                    />
                </div>
            </div>

            {/* Buy It Again Shelf (Horizontal Scroll) */}
            {user && reorderItems.length > 0 && (
                <div style={{ marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Zap size={24} color="#FFD700" fill="#FFD700" />
                        BUY IT AGAIN
                    </h2>
                    <div style={{ display: 'flex', overflowX: 'auto', gap: '20px', paddingBottom: '20px', scrollbarWidth: 'none' }}>
                        {reorderItems.map(item => (
                            <div key={item._id} className="glass-panel" style={{ minWidth: '220px', padding: '15px', textAlign: 'center' }}>
                                <img src={item.imageUrl} alt={item.name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-blue)', marginBottom: '10px' }} />
                                <h4 style={{ fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--primary-blue)', fontWeight: 'bold' }}>₹{item.price}</p>
                                <button className="btn btn-primary" onClick={() => addToCart(item)} style={{ width: '100%', marginTop: '10px', padding: '8px' }}>
                                    Add again
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Combined Filter Area */}
            <div style={{ marginBottom: '50px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                {/* Category Filter */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setSelectedCategory(cat)}
                            className={`btn ${selectedCategory === cat ? 'btn-primary' : ''}`}
                            style={{ borderRadius: '30px', padding: '10px 20px', fontSize: '0.9rem' }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Restaurant Filter */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {restaurants.map(res => (
                        <button 
                            key={res} 
                            onClick={() => setSelectedRestaurant(res)}
                            className={`btn ${selectedRestaurant === res ? 'btn-primary' : ''}`}
                            style={{ borderRadius: '14px', padding: '8px 18px', fontSize: '0.85rem', borderColor: selectedRestaurant === res ? 'var(--primary-blue)' : 'var(--glass-border)' }}
                        >
                            <MapPin size={14} style={{ marginRight: '5px' }} />
                            {res}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '35px' }}>
                {sortedItems.map(item => (
                    <MenuCard key={item._id} item={item} addToCart={addToCart} isFavorite={user?.favorites?.includes(item._id)} />
                ))}
            </div>
            
            {sortedItems.length === 0 && (
                <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
                    <Search size={60} style={{ opacity: 0.2, marginBottom: '20px' }} />
                    <h3>No cravings found matching your search.</h3>
                </div>
            )}
        </div>
    );
};

const MenuCard = ({ item, addToCart, isFavorite }) => {
    const [imgLoading, setImgLoading] = useState(true);

    return (
        <div className="glass-panel" style={{ overflow: 'hidden', paddingBottom: '25px', position: 'relative' }}>
            {isFavorite && (
                <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, background: 'rgba(0, 240, 255, 0.2)', backdropFilter: 'blur(5px)', borderRadius: '50%', padding: '10px', border: '1px solid var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={20} fill="var(--primary-blue)" color="var(--primary-blue)" />
                </div>
            )}

            {item.isChefSpecial && (
                <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, background: 'linear-gradient(90deg, #ff0077, #ff9900)', borderRadius: '20px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', boxShadow: '0 0 15px rgba(255, 0, 119, 0.5)' }}>
                    <Flame size={14} /> CHEF'S SPECIAL
                </div>
            )}
            
            <div style={{ width: '100%', height: '280px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000' }}>
                {imgLoading && <div className="spinner"></div>}
                <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    onLoad={() => setImgLoading(false)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: imgLoading ? 'none' : 'block' }}
                />
                <div style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', background: 'linear-gradient(to top, rgba(5,5,5,0.9), transparent)', padding: '20px', height: '80px', display: 'flex', alignItems: 'flex-end' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                        <Star size={14} fill="#FFD700" color="#FFD700" />
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>{item.rating}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({item.reviews} reviews)</span>
                     </div>
                </div>
            </div>

            <div style={{ padding: '25px 25px 0 25px' }}>
                <div style={{ marginBottom: '15px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--primary-blue)', fontWeight: 600, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                        <MapPin size={12} />{item.restaurantName?.toUpperCase() || 'FOODIFY'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{item.name}</h3>
                        <span style={{ fontSize: '0.7rem', padding: '4px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '20px', color: 'var(--text-muted)' }}>{item.category}</span>
                    </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '25px', lineHeight: '1.6', minHeight: '65px' }}>{item.description}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>₹{item.price}</span>
                    <button className="btn btn-primary" onClick={() => addToCart(item)} style={{ padding: '12px 30px' }}>
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
