import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, Heart, Wallet } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const Navbar = () => {
    const { user, cart, logout } = useContext(AppContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <nav style={{ padding: '20px 0', borderBottom: '1px solid var(--glass-border)', position: 'fixed', width: '100%', top: 0, zIndex: 100, background: 'rgba(5, 5, 5, 0.8)', backdropFilter: 'blur(10px)' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '1px' }}>
                    <span className="text-gradient">FOODI</span> FY
                </Link>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    {user && (
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            {/* Glowing Wallet Balance */}
                            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px', border: '1px solid var(--primary-blue)', boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)' }}>
                                <Wallet size={18} color="var(--primary-blue)" />
                                <span style={{ fontWeight: 'bold', color: '#fff' }}>₹{user.walletBalance || 0}</span>
                            </div>

                            <Link to="/favorites" className="btn" style={{ borderColor: 'transparent', color: 'var(--primary-blue)', padding: '8px' }}>
                                <Heart size={20} />
                            </Link>
                            <Link to="/orders" className="btn" style={{ borderColor: 'transparent', padding: '8px' }}>
                                <Package size={20} />
                            </Link>
                        </div>
                    )}

                    <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center' }} className="btn">
                        <ShoppingCart size={20} />
                        {cartItemsCount > 0 && (
                            <span style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--primary-blue)', color: '#000', borderRadius: '50%', padding: '2px 8px', fontSize: '12px', fontWeight: 'bold' }}>
                                {cartItemsCount}
                            </span>
                        )}
                    </Link>

                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ color: 'var(--text-muted)', display: 'none' }}>Hi, {user.name}</span>
                            <button onClick={handleLogout} className="btn" style={{ borderColor: 'rgba(255,0,0,0.3)', color: '#ff4d4d', padding: '8px' }}>
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary">
                            <User size={18} /> Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
