import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Clock, Package, MapPin, Wallet, Sparkles } from 'lucide-react';

const OrderSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get rewards data from state
    const { cashback, discount } = location.state || { cashback: 0, discount: 0 };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="container page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 0' }}>
            <div className="glass-panel pulse" style={{ width: '120px', height: '120px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px', background: 'rgba(0, 240, 255, 0.1)', border: '2px solid var(--primary-blue)' }}>
                <CheckCircle size={60} color="var(--primary-blue)" />
            </div>

            <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '20px' }}>Order Confirmed!</h1>
            <p style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '40px', maxWidth: '600px' }}>Your request has been processed. Our cyber-chefs are now preparing your authentic dishes with precision.</p>

            {/* REWARD CARD */}
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '20px', marginBottom: '60px', border: '1px solid var(--primary-blue)', background: 'rgba(0, 240, 255, 0.05)', animation: 'fadeIn 1s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                    <Sparkles size={24} color="#FFD700" fill="#FFD700" />
                    <h3 style={{ textTransform: 'uppercase', letterSpacing: '2px' }}>Loyalty Reward</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Credits Earned</span>
                        <span style={{ color: 'var(--primary-blue)', fontWeight: 'bold' }}>+₹{cashback}</span>
                    </div>
                    {discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Wallet Discount</span>
                            <span style={{ color: '#ff0077', fontWeight: 'bold' }}>-₹{discount}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '60px' }}>
                <div style={{ flex: 1, borderRight: '1px solid var(--glass-border)', paddingRight: '20px' }}>
                    <div style={{ color: 'var(--primary-blue)', marginBottom: '10px' }}><Clock size={32} /></div>
                    <h3 style={{ marginBottom: '10px' }}>Est. Time</h3>
                    <p style={{ color: 'var(--text-muted)' }}>25 - 40 Mins</p>
                </div>
                <div style={{ flex: 1, borderRight: '1px solid var(--glass-border)', paddingRight: '20px' }}>
                    <div style={{ color: 'var(--primary-blue)', marginBottom: '10px' }}><Package size={32} /></div>
                    <h3 style={{ marginBottom: '10px' }}>Status</h3>
                    <p style={{ color: '#FFD700' }}>Preparing</p>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--primary-blue)', marginBottom: '10px' }}><MapPin size={32} /></div>
                    <h3 style={{ marginBottom: '10px' }}>Tracking</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Enabled</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                <button onClick={() => navigate('/orders')} className="btn btn-primary" style={{ padding: '15px 40px', fontSize: '1.1rem' }}>
                    Track Order Live
                </button>
                <button onClick={() => navigate('/')} className="btn" style={{ padding: '15px 40px', fontSize: '1.1rem' }}>
                    Order More
                </button>
            </div>
        </div>
    );
};

export default OrderSuccess;
