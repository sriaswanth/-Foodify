import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Trash2 } from 'lucide-react';

const Cart = () => {
    const { cart, removeFromCart, getCartTotal, user } = useContext(AppContext);
    const navigate = useNavigate();

    const deliveryFee = 50;

    const handleCheckout = () => {
        if (!user) {
            navigate('/login');
        } else {
            navigate('/checkout');
        }
    };

    if (cart.length === 0) {
        return (
            <div className="container page" style={{ textAlign: 'center', paddingTop: '150px' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Your cart is empty</h2>
                <Link to="/" className="btn btn-primary">Browse Menu</Link>
            </div>
        );
    }

    return (
        <div className="container page">
            <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '40px' }}>Your Cart</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
                <div>
                    {cart.map(item => (
                        <div key={item._id} className="glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '20px', marginBottom: '20px', gap: '20px' }}>
                            <div style={{ width: '100px', height: '100px', background: `url(${item.imageUrl}) center/cover no-repeat`, borderRadius: '8px' }} />
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{item.name}</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Quantity: {item.quantity}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-blue)', marginBottom: '10px' }}>
                                    ₹{(item.price * item.quantity)}
                                </p>
                                <button onClick={() => removeFromCart(item._id)} className="btn" style={{ padding: '8px', borderColor: 'rgba(255,0,0,0.3)', color: '#ff4d4d' }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div>
                    <div className="glass-panel" style={{ padding: '30px', position: 'sticky', top: '100px' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>Order Summary</h3>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                            <span>₹{getCartTotal()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
                            <span>₹{deliveryFee}</span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '1.3rem', fontWeight: 'bold', borderTop: '1px solid var(--glass-border)', paddingTop: '15px' }}>
                            <span>Total</span>
                            <span className="text-gradient">₹{(getCartTotal() + deliveryFee)}</span>
                        </div>

                        <button onClick={handleCheckout} className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '15px' }}>
                            {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
