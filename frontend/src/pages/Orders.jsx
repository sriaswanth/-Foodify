import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Clock, Truck, ChefHat, CheckCircle } from 'lucide-react';

const Orders = () => {
    const { token, updateFavorites } = useContext(AppContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        fetchOrders();
        
        // Update current time every 10 seconds to refresh progress bars
        const timer = setInterval(() => setCurrentTime(new Date()), 10000);
        return () => clearInterval(timer);
    }, [token]);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setOrders(data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setLoading(false);
        }
    };

    const handleReceiveOrder = async (orderId) => {
        try {
            const res = await fetch(`${API_BASE}/api/orders/${orderId}/receive`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (res.ok) {
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'Received' } : o));
                if (data.favorites) {
                    updateFavorites(data.favorites);
                }
            } else {
                console.error("Failed to mark order as received:", data.error);
            }
        } catch (err) {
            console.error("Error updating order:", err);
        }
    };

    if (loading) return <div className="container page"><h2 style={{textAlign: 'center'}}>Loading Orders...</h2></div>;

    if (!token) {
        return <div className="container page" style={{textAlign: 'center'}}><h2>Please login to view your orders.</h2></div>;
    }

    const sortedAll = [...orders].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    const pendingOrders = sortedAll.filter(o => o.status !== 'Received');
    const pastOrders = sortedAll.filter(o => o.status === 'Received');

    return (
        <div className="container page">
            <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '30px', textAlign: 'center' }}>My Orders</h1>
            
            <div style={{ marginBottom: '50px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '30px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>Active Parcels</h2>
                {pendingOrders.length === 0 ? <p style={{color: 'var(--text-muted)'}} className="text-center">No active parcels arriving.</p> : null}
                
                <div style={{ display: 'grid', gap: '30px' }}>
                    {pendingOrders.map(order => (
                        <div key={order._id} className="glass-panel" style={{ padding: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Order ID: {order._id}</p>
                                    <p style={{ fontSize: '1.3rem', fontWeight: 600 }}>
                                        {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                                    </p>
                                    <p style={{ fontWeight: 'bold', fontSize: '1.2rem', marginTop: '5px' }}>Total: <span style={{color: 'var(--primary-blue)'}}>₹{order.totalAmount}</span></p>
                                </div>
                                <button className="btn btn-primary" onClick={() => handleReceiveOrder(order._id)}>
                                    Received Parcel
                                </button>
                            </div>

                            {/* Live Progress Tracker */}
                            <LiveTracker createdAt={order.createdAt} currentTime={currentTime} />
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 Delivered to: {order.deliveryAddress}</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ordered: {new Date(order.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>Past Orders</h2>
                {pastOrders.length === 0 ? <p style={{color: 'var(--text-muted)'}}>No past orders found.</p> : null}

                <div style={{ display: 'grid', gap: '20px' }}>
                    {pastOrders.map(order => (
                        <div key={order._id} className="glass-panel" style={{ padding: '20px', opacity: 0.7 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Order ID: {order._id}</p>
                                <p style={{ color: 'var(--primary-blue)', fontSize: '0.9rem', fontWeight: 'bold' }}>✓ Delivered</p>
                            </div>
                            <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>
                                {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                            </p>
                            <p style={{ fontWeight: 'bold' }}>Total: ₹{order.totalAmount}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '5px' }}>Completed: {new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const LiveTracker = ({ createdAt, currentTime }) => {
    const elapsed = (currentTime - new Date(createdAt)) / 1000 / 60; // elapsed in minutes
    
    // Status thresholds (minutes)
    const stages = [
        { label: 'Received', icon: <Clock size={16} />, threshold: 0 },
        { label: 'Preparing', icon: <ChefHat size={16} />, threshold: 5 },
        { label: 'On the Way', icon: <Truck size={16} />, threshold: 15 },
        { label: 'Arriving', icon: <CheckCircle size={16} />, threshold: 25 },
    ];

    const currentStageIndex = [...stages].reverse().findIndex(s => elapsed >= s.threshold);
    const activeIndex = currentStageIndex === -1 ? 0 : stages.length - 1 - currentStageIndex;

    return (
        <div style={{ margin: '30px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', position: 'relative' }}>
                {/* Background Line */}
                <div style={{ position: 'absolute', top: '15px', left: '0', width: '100%', height: '2px', background: 'var(--glass-border)', zIndex: 0 }}></div>
                
                {/* Progress Fill */}
                <div style={{ 
                    position: 'absolute', 
                    top: '15px', 
                    left: '0', 
                    width: `${(activeIndex / (stages.length - 1)) * 100}%`, 
                    height: '2px', 
                    background: 'var(--primary-blue)', 
                    boxShadow: '0 0 10px var(--primary-blue)',
                    transition: 'width 1s ease-in-out',
                    zIndex: 1 
                }}></div>

                {stages.map((stage, idx) => {
                    const isActive = idx <= activeIndex;
                    const isCurrent = idx === activeIndex;

                    return (
                        <div key={stage.label} style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px' }}>
                            <div style={{ 
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '50%', 
                                background: isActive ? 'var(--bg-dark)' : 'var(--glass-bg)', 
                                border: `2px solid ${isActive ? 'var(--primary-blue)' : 'var(--glass-border)'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isActive ? 'var(--primary-blue)' : 'var(--text-muted)',
                                boxShadow: isCurrent ? '0 0 15px var(--primary-blue)' : 'none',
                                transition: 'all 0.5s ease',
                                marginBottom: '10px'
                            }}>
                                {stage.icon}
                            </div>
                            <span style={{ 
                                fontSize: '0.75rem', 
                                color: isActive ? '#fff' : 'var(--text-muted)',
                                fontWeight: isCurrent ? 'bold' : 'normal',
                                textShadow: isCurrent ? '0 0 5px rgba(255,255,255,0.5)' : 'none'
                            }}>
                                {stage.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Orders;
