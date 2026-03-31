import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Wallet, CheckCircle } from 'lucide-react';

const Checkout = () => {
    const { cart, getCartTotal, token, clearCart, user, updateWallet } = useContext(AppContext);
    const [address, setAddress] = useState('');
    const [useWallet, setUseWallet] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const deliveryFee = 50;
    const initialTotal = getCartTotal() + deliveryFee;
    
    // Calculate preview of discount if wallet is used
    const walletBalance = user?.walletBalance || 0;
    const discountAmount = useWallet ? Math.min(walletBalance, initialTotal) : 0;
    const finalOrderTotal = initialTotal - discountAmount;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const orderData = {
            items: cart.map(item => ({
                menuItem: item._id,
                quantity: item.quantity,
                name: item.name,
                price: item.price
            })),
            totalAmount: initialTotal, // Send initial total, backend calculates discount
            deliveryAddress: address,
            useWallet: useWallet
        };

        try {
            const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const API_BASE = rawApiUrl.startsWith('http') ? rawApiUrl : `https://${rawApiUrl}`;
            const res = await fetch(`${API_BASE}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            const data = await res.json();
            
            if (res.ok) {
                clearCart();
                // Update local wallet balance with new balance returned from server
                if (data.newWalletBalance !== undefined) {
                    updateWallet(data.newWalletBalance);
                }
                // Redirect with cashback info
                navigate('/order-success', { state: { cashback: data.cashbackEarned, discount: data.discountApplied } });
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Error placing order.');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        navigate('/');
        return null;
    }

    return (
        <div className="container page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '550px', padding: '40px' }}>
                <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '20px', fontSize: '2.5rem' }}>Checkout</h2>
                
                {error && <p style={{ color: '#ff4d4d', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
                
                <div style={{ marginBottom: '30px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Order Summary</h3>
                    {cart.map(item => (
                        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '10px' }}>
                            <span>{item.quantity}x {item.name}</span>
                            <span>₹{(item.price * item.quantity)}</span>
                        </div>
                    ))}
                    
                    {useWallet && walletBalance > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary-blue)', margin: '15px 0' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Wallet size={16} /> Wallet Discount</span>
                            <span>-₹{discountAmount}</span>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        <span>Total to Pay</span>
                        <span className="text-gradient">₹{finalOrderTotal}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Wallet Toggle - Always Visible now */}
                    <div 
                        className="glass-panel" 
                        style={{ 
                            padding: '20px', 
                            marginBottom: '25px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            cursor: walletBalance > 0 ? 'pointer' : 'not-allowed', 
                            border: useWallet ? '2px solid var(--primary-blue)' : '1px solid var(--glass-border)',
                            background: useWallet ? 'rgba(0, 240, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                            boxShadow: useWallet ? '0 0 20px rgba(0, 240, 255, 0.2)' : 'none',
                            opacity: walletBalance > 0 ? 1 : 0.6
                        }} 
                        onClick={() => walletBalance > 0 && setUseWallet(!useWallet)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ background: walletBalance > 0 ? 'var(--primary-blue)' : 'var(--glass-border)', borderRadius: '50%', padding: '10px', color: '#000' }}>
                                <Wallet size={24} />
                            </div>
                            <div>
                                <p style={{ fontSize: '1.1rem', fontWeight: 800 }}>Apply Cashback Balance</p>
                                <p style={{ fontSize: '0.85rem', color: walletBalance > 0 ? 'var(--primary-blue)' : 'var(--text-muted)', fontWeight: 600 }}>
                                    {walletBalance > 0 ? `Available: ₹${walletBalance}` : 'Collect credits from your first order!'}
                                </p>
                            </div>
                        </div>
                        {walletBalance > 0 && (
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid var(--primary-blue)', background: useWallet ? 'var(--primary-blue)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {useWallet && <CheckCircle size={18} color="#000" />}
                            </div>
                        )}
                    </div>

                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Delivery Address</h3>
                    <textarea 
                        className="input-field" 
                        placeholder="Where should Foodify deliver?" 
                        rows="3" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                        required 
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--glass-border)', borderRadius: '14px', width: '100%', padding: '15px', marginBottom: '25px', outline: 'none' }}
                    />
                    
                    <div style={{ background: 'rgba(0,0,0,0.5)', padding: '15px', borderRadius: '14px', border: '1px solid var(--glass-border)', marginBottom: '25px' }}>
                        <p style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                            <span style={{ color: 'var(--primary-blue)' }}>●</span> Payment: Cash on Delivery
                        </p>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.2rem', padding: '15px', fontWeight: '800' }} disabled={loading}>
                        {loading ? 'PROCESSING ORDER...' : 'CONFIRM ORDER'}
                    </button>
                    
                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--primary-blue)', marginTop: '15px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        EARN ₹{Math.floor(finalOrderTotal * 0.1)} CREDITS ON THIS ORDER
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
