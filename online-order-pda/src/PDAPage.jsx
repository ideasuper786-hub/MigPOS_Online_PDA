// src/PDAPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { 
  FaSearch, FaShoppingCart, FaTrash, FaPlus, FaMinus, 
  FaHeart, FaClock, FaFire, FaUser, FaSignOutAlt, 
  FaCreditCard, FaMoneyBillWave, FaPaypal, FaHome, 
  FaBars, FaTimes, FaCheckCircle, FaTimesCircle, FaShieldAlt
} from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const API_BASE = 'http://127.0.0.1:8000/api';

// Helper: returns emoji based on category name
const getCategoryIcon = (category) => {
  const n = category.name.toLowerCase();
  if (n.includes('burger')) return '🍔';
  if (n.includes('pizza')) return '🍕';
  if (n.includes('dessert')) return '🍰';
  if (n.includes('drink')) return '🥤';
  if (n.includes('fruit')) return '🍎';
  if (n.includes('fast')) return '🍟';
  return '🍽️';
};

function PDAPage() {
  // State
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [user, setUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const megaMenuRef = useRef(null);
  const menuButtonRef = useRef(null);

  // Filter & sort
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');

  const offerSlides = [
    { id: 1, title: 'Pizza Mania', description: 'Buy 1 Get 1 Free', discount: '50% OFF', bg: 'bg-gradient-to-r from-red-500 to-orange-500', icon: '🍕' },
    { id: 2, title: 'Burger Feast', description: 'Combo for 2', discount: '$10 OFF', bg: 'bg-gradient-to-r from-yellow-500 to-amber-500', icon: '🍔' },
    { id: 3, title: 'Groceries Deal', description: 'Fresh Fruits & Veggies', discount: '20% OFF', bg: 'bg-gradient-to-r from-green-500 to-emerald-500', icon: '🥦' },
  ];

  // Load categories
  useEffect(() => {
    axios.get(`${API_BASE}/categories`)
      .then(res => {
        setCategories(res.data);
        if (res.data.length > 0) setSelectedCategory(res.data[0].id);
      })
      .catch(err => console.error('Categories error:', err));
  }, []);

  // Load products when category changes
  useEffect(() => {
    if (selectedCategory) {
      setLoading(true);
      axios.get(`${API_BASE}/products/category/${selectedCategory}`)
        .then(res => {
          setProducts(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Products error:', err);
          setLoading(false);
        });
    }
  }, [selectedCategory]);

  // Load localStorage data
  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) setRecentlyViewed(JSON.parse(stored));
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    const storedOrders = localStorage.getItem('pendingOrders');
    if (storedOrders) setPendingOrders(JSON.parse(storedOrders));
  }, []);

  // Close mega menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target) &&
          menuButtonRef.current && !menuButtonRef.current.contains(event.target)) {
        setShowMegaMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addToRecentlyViewed = (product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      const newList = [product, ...filtered].slice(0, 6);
      localStorage.setItem('recentlyViewed', JSON.stringify(newList));
      return newList;
    });
  };

  // Auth handlers
  const handleLogin = (e) => {
    e.preventDefault();
    let role = 'customer';
    if (authEmail === 'admin@example.com') role = 'admin';
    const mockUser = { id: role === 'admin' ? 'admin' : '1', name: authEmail.split('@')[0], email: authEmail, role };
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    setShowAuthModal(false);
    setAuthEmail('');
    setAuthPassword('');
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const mockUser = { id: '2', name: authName, email: authEmail, role: 'customer' };
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    setShowAuthModal(false);
    setAuthName('');
    setAuthEmail('');
    setAuthPassword('');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Filtering & sorting
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.texttip && product.texttip.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === '' || product.category === filterCategory;
      const price = parseFloat(product.pricesell);
      const matchesPrice = (priceMin === '' || price >= parseFloat(priceMin)) &&
                          (priceMax === '' || price <= parseFloat(priceMax));
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      const priceA = parseFloat(a.pricesell);
      const priceB = parseFloat(b.pricesell);
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      switch (sortBy) {
        case 'name_asc': return nameA.localeCompare(nameB);
        case 'name_desc': return nameB.localeCompare(nameA);
        case 'price_asc': return priceA - priceB;
        case 'price_desc': return priceB - priceA;
        default: return 0;
      }
    });

  const topOfWeek = filteredProducts.slice(0, 4);
  const popularNow = filteredProducts.slice(4, 8);

  // Cart functions
  const addToCart = (product) => {
    addToRecentlyViewed(product);
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        return newQty <= 0 ? null : { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const removeItem = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.pricesell * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Order placement with approval
  const placeOrder = (customerData) => {
    const orderData = {
      id: Date.now().toString(),
      customer: customerData,
      items: cart,
      paymentMethod,
      total: cartTotal,
      timestamp: new Date().toISOString(),
      status: user?.role === 'admin' ? 'approved' : 'pending'
    };

    if (user?.role === 'admin') {
      const payload = {
        customer_name: customerData.name,
        customer_phone: customerData.phone,
        customer_address: customerData.address,
        payment_method: paymentMethod,
        user_id: user.id,
        items: cart.map(item => ({ product_id: item.id, quantity: item.quantity }))
      };
      axios.post(`${API_BASE}/order`, payload)
        .then(res => {
          alert(`✅ Order #${res.data.order_id} approved and sent to POS.`);
          setCart([]);
          setShowCheckout(false);
          setShowCart(false);
        })
        .catch(err => alert('❌ POS error: ' + err.message));
    } else {
      const existingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      existingOrders.push(orderData);
      localStorage.setItem('pendingOrders', JSON.stringify(existingOrders));
      setPendingOrders(existingOrders);
      alert('📋 Order placed! Waiting for admin approval.');
      setCart([]);
      setShowCheckout(false);
      setShowCart(false);
    }
  };

  const approveOrder = (order) => {
    const payload = {
      customer_name: order.customer.name,
      customer_phone: order.customer.phone,
      customer_address: order.customer.address,
      payment_method: order.paymentMethod,
      user_id: null,
      items: order.items.map(item => ({ product_id: item.id, quantity: item.quantity }))
    };
    axios.post(`${API_BASE}/order`, payload)
      .then(res => {
        alert(`✅ Order #${res.data.order_id} approved and sent to POS.`);
        const updated = pendingOrders.filter(o => o.id !== order.id);
        setPendingOrders(updated);
        localStorage.setItem('pendingOrders', JSON.stringify(updated));
      })
      .catch(err => alert('❌ POS error: ' + err.message));
  };

  const rejectOrder = (orderId) => {
    const updated = pendingOrders.filter(o => o.id !== orderId);
    setPendingOrders(updated);
    localStorage.setItem('pendingOrders', JSON.stringify(updated));
    alert('Order rejected.');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setPriceMin('');
    setPriceMax('');
    setSortBy('name_asc');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">MigPOS Online PDA</h1>

          <nav className="hidden md:flex items-center gap-4">
            <a href="#" className="text-gray-700 hover:text-blue-600 flex items-center gap-1"><FaHome /> Home</a>
            <div className="relative" onMouseEnter={() => setShowMegaMenu(true)} onMouseLeave={() => setShowMegaMenu(false)}>
              <button ref={menuButtonRef} className="text-gray-700 hover:text-blue-600 flex items-center gap-1"><FaBars /> Menu</button>
              {showMegaMenu && (
                <div ref={megaMenuRef} className="absolute left-0 top-full mt-2 w-screen max-w-4xl bg-white shadow-xl rounded-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 z-50">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={() => { setSelectedCategory(cat.id); setShowMegaMenu(false); }}>
                      <div className="text-3xl">{getCategoryIcon(cat)}</div>
                      <span className="font-bold">{cat.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <a href="#" className="text-gray-700 hover:text-blue-600">Contact us</a>
            <a href="#" className="text-gray-700 hover:text-blue-600">About us</a>
            <a href="#" className="text-gray-700 hover:text-blue-600">Help</a>
            {user ? (
              <>
                {user.role === 'admin' && <button onClick={() => setShowAdminPanel(true)} className="text-gray-700 hover:text-blue-600 flex items-center gap-1"><FaShieldAlt /> Admin</button>}
                <button onClick={handleLogout} className="text-gray-700 hover:text-blue-600 flex items-center gap-1"><FaSignOutAlt /> Logout</button>
              </>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="text-gray-700 hover:text-blue-600 flex items-center gap-1"><FaUser /> Login/Register</button>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowCart(true)} className="relative text-gray-700 hover:text-blue-600 md:hidden">
              <FaShoppingCart className="text-2xl" />
              {cartItemCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartItemCount}</span>}
            </button>
            <button onClick={() => setMobileMenuOpen(true)} className="text-gray-700 md:hidden text-2xl"><FaBars /></button>
          </div>

          <button onClick={() => setShowCart(true)} className="relative text-gray-700 hover:text-blue-600 hidden md:block">
            <FaShoppingCart className="text-2xl" />
            {cartItemCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartItemCount}</span>}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 w-64 bg-white h-full shadow-xl p-5 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-3"><span className="font-bold">Menu</span><button onClick={() => setMobileMenuOpen(false)}><FaTimes /></button></div>
            <a href="#" className="text-gray-700 hover:text-blue-600 flex items-center gap-2"><FaHome /> Home</a>
            <div className="relative">
              <button className="text-gray-700 hover:text-blue-600 flex items-center gap-2 w-full text-left" onClick={() => setShowMegaMenu(!showMegaMenu)}><FaBars /> Menu</button>
              {showMegaMenu && (
                <div className="mt-2 pl-4 flex flex-col gap-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded cursor-pointer" onClick={() => { setSelectedCategory(cat.id); setShowMegaMenu(false); setMobileMenuOpen(false); }}>
                      <div className="text-2xl">{getCategoryIcon(cat)}</div>
                      <span className="font-bold">{cat.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <a href="#" className="text-gray-700 hover:text-blue-600">Contact us</a>
            <a href="#" className="text-gray-700 hover:text-blue-600">About us</a>
            <a href="#" className="text-gray-700 hover:text-blue-600">Help</a>
            {user ? (
              <>
                {user.role === 'admin' && <button onClick={() => { setShowAdminPanel(true); setMobileMenuOpen(false); }} className="text-gray-700 hover:text-blue-600 flex items-center gap-2"><FaShieldAlt /> Admin</button>}
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-gray-700 hover:text-blue-600 flex items-center gap-2"><FaSignOutAlt /> Logout</button>
              </>
            ) : (
              <button onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }} className="text-gray-700 hover:text-blue-600 flex items-center gap-2"><FaUser /> Login/Register</button>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">{isLogin ? 'Sign In' : 'Register'}</h2><button onClick={() => setShowAuthModal(false)} className="text-gray-500 text-2xl">&times;</button></div>
            <form onSubmit={isLogin ? handleLogin : handleRegister}>
              {!isLogin && <div className="mb-3"><label className="block text-gray-700 mb-1">Full Name</label><input type="text" className="w-full border rounded-lg p-2" value={authName} onChange={e => setAuthName(e.target.value)} required /></div>}
              <div className="mb-3"><label className="block text-gray-700 mb-1">Email</label><input type="email" className="w-full border rounded-lg p-2" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required /></div>
              <div className="mb-4"><label className="block text-gray-700 mb-1">Password</label><input type="password" className="w-full border rounded-lg p-2" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required /></div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">{isLogin ? 'Sign In' : 'Register'}</button>
              <p className="text-center mt-3 text-sm">{isLogin ? "Don't have an account? " : "Already have an account? "}<button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-600">{isLogin ? 'Register' : 'Sign In'}</button></p>
            </form>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {showAdminPanel && user?.role === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">Pending Orders for Approval</h2><button onClick={() => setShowAdminPanel(false)} className="text-gray-500 text-2xl">&times;</button></div>
            {pendingOrders.length === 0 ? <p className="text-gray-500 text-center py-8">No pending orders.</p> : (
              <div className="space-y-4">
                {pendingOrders.map(order => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <p><strong>Order ID:</strong> {order.id}</p>
                        <p><strong>Customer:</strong> {order.customer.name} ({order.customer.phone})</p>
                        <p><strong>Address:</strong> {order.customer.address || 'Not provided'}</p>
                        <p><strong>Payment:</strong> {order.paymentMethod}</p>
                        <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                        <div className="mt-2"><strong>Items:</strong><ul className="list-disc list-inside">{order.items.map(item => <li key={item.id}>{item.name} x {item.quantity}</li>)}</ul></div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => approveOrder(order)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><FaCheckCircle /> Approve</button>
                        <button onClick={() => rejectOrder(order.id)} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><FaTimesCircle /> Reject</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Slider */}
      <Swiper modules={[Autoplay, Pagination, Navigation]} autoplay={{ delay: 4000, disableOnInteraction: false }} pagination={{ clickable: true }} navigation loop className="w-full h-80 md:h-96">
        {offerSlides.map(offer => (
          <SwiperSlide key={offer.id}>
            <div className={`${offer.bg} w-full h-full flex items-center justify-center p-8`}>
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 text-center shadow-2xl max-w-md mx-auto">
                <div className="text-7xl mb-4">{offer.icon}</div>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-800">{offer.title}</h2>
                <p className="text-lg md:text-xl text-gray-600 mt-2">{offer.description}</p>
                <div className="mt-4 inline-block bg-red-600 text-white px-6 py-2 rounded-full text-xl font-bold">{offer.discount}</div>
                <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg transition">Grab Deal</button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Filter Bar */}
      <div className="sticky top-[73px] z-20 bg-white shadow-md py-4 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[180px]"><label className="block text-xs font-medium text-gray-500 mb-1">Search</label><div className="relative"><FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Product name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div></div>
            <div className="w-44"><label className="block text-xs font-medium text-gray-500 mb-1">Category</label><select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-3"><option value="">All</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div>
            <div className="w-36"><label className="block text-xs font-medium text-gray-500 mb-1">Min Price</label><input type="number" placeholder="0" value={priceMin} onChange={e => setPriceMin(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-3" /></div>
            <div className="w-36"><label className="block text-xs font-medium text-gray-500 mb-1">Max Price</label><input type="number" placeholder="1000" value={priceMax} onChange={e => setPriceMax(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-3" /></div>
            <div className="w-44"><label className="block text-xs font-medium text-gray-500 mb-1">Sort by</label><select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-3"><option value="name_asc">Name (A-Z)</option><option value="name_desc">Name (Z-A)</option><option value="price_asc">Price (Low to High)</option><option value="price_desc">Price (High to Low)</option></select></div>
            <button onClick={clearFilters} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium">Clear Filters</button>
          </div>
        </div>
      </div>

      {/* Category Slider – Big Square Cards, Slow Right‑to‑Left Motion */}
      {categories.length > 0 ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 overflow-hidden">
          <Swiper
            modules={[Autoplay]}
            slidesPerView="auto"
            spaceBetween={24}
            autoplay={{
              delay: 0,
              disableOnInteraction: false,
              reverseDirection: true,
              pauseOnMouseEnter: true,
            }}
            speed={8000}
            loop={true}
            freeMode={false}
            className="category-slider w-full"
            style={{ overflow: 'visible' }}
          >
            {categories.map(cat => (
              <SwiperSlide key={cat.id} style={{ width: '160px', height: '160px' }}>
                <button
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex flex-col items-center justify-center w-full h-full rounded-2xl shadow-lg transition-all duration-200 ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white scale-105'
                      : 'bg-white text-gray-700 hover:bg-blue-50 hover:shadow-xl'
                  }`}
                >
                  <div className="text-5xl mb-2">{getCategoryIcon(cat)}</div>
                  <span className="text-base font-bold text-center px-2">{cat.name}</span>
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 text-center py-8 bg-yellow-50 rounded-lg">
          <p className="text-yellow-700">⚠️ No categories found. Please check your database or API connection.</p>
          <p className="text-sm text-gray-500 mt-2">Open browser console (F12) to see the API response.</p>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <section className="mb-12"><h2 className="text-2xl font-bold mb-5 flex items-center gap-2"><FaHeart className="text-red-500" /> Top of the week</h2>{loading ? <div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div> : topOfWeek.length === 0 ? <p className="text-gray-500 text-center py-8">No items available</p> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{topOfWeek.map(product => <ProductCard key={product.id} product={product} onAdd={addToCart} />)}</div>}</section>
        <section className="mb-12"><h2 className="text-2xl font-bold mb-5 flex items-center gap-2"><FaFire className="text-orange-500" /> Popular Now</h2>{loading ? <div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div> : popularNow.length === 0 ? <p className="text-gray-500 text-center py-8">No items available</p> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{popularNow.map(product => <ProductCard key={product.id} product={product} onAdd={addToCart} />)}</div>}</section>
        <section className="mb-12"><h2 className="text-2xl font-bold mb-5">{categories.find(c => c.id === selectedCategory)?.name || 'Menu'} Items</h2>{loading ? <div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div> : filteredProducts.length === 0 ? <p className="text-gray-500 text-center py-8">No products found</p> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{filteredProducts.map(product => <ProductCard key={product.id} product={product} onAdd={addToCart} />)}</div>}</section>
        {recentlyViewed.length > 0 && <section><h2 className="text-2xl font-bold mb-5 flex items-center gap-2"><FaClock className="text-blue-500" /> Recently viewed</h2><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{recentlyViewed.map(product => <ProductCard key={product.id} product={product} onAdd={addToCart} />)}</div></section>}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div><h3 className="text-xl font-bold mb-4">MigPOS</h3><p className="text-gray-400">Your complete POS and online ordering solution. Fast, reliable, and easy to use.</p></div>
            <div><h4 className="font-semibold mb-3">Quick Links</h4><ul className="space-y-2 text-gray-400"><li><a href="#" className="hover:text-white">Home</a></li><li><a href="#" className="hover:text-white">Menu</a></li><li><a href="#" className="hover:text-white">Contact Us</a></li><li><a href="#" className="hover:text-white">About Us</a></li></ul></div>
            <div><h4 className="font-semibold mb-3">Support</h4><ul className="space-y-2 text-gray-400"><li><a href="#" className="hover:text-white">Help Center</a></li><li><a href="#" className="hover:text-white">Privacy Policy</a></li><li><a href="#" className="hover:text-white">Terms of Service</a></li></ul></div>
            <div><h4 className="font-semibold mb-3">Contact</h4><p className="text-gray-400">📍 123 Business Street, City</p><p className="text-gray-400">📞 +1 234 567 890</p><p className="text-gray-400">✉️ info@migpos.com</p></div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">&copy; 2025 MigPOS. All rights reserved.</div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-in">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50"><h2 className="text-2xl font-bold flex items-center gap-2"><FaShoppingCart /> Your Order</h2><button onClick={() => setShowCart(false)} className="text-gray-500 text-3xl">&times;</button></div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? <p className="text-center text-gray-400 py-10">Cart is empty</p> : cart.map(item => (
                <div key={item.id} className="flex justify-between items-center border-b pb-3">
                  <div className="flex-1"><p className="font-semibold">{item.name}</p><p className="text-sm text-gray-500">${item.pricesell} each</p></div>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"><FaMinus /></button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"><FaPlus /></button>
                    <button onClick={() => removeItem(item.id)} className="text-red-500"><FaTrash /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 border-t bg-gray-50"><div className="flex justify-between text-xl font-bold mb-4"><span>Total:</span><span>${cartTotal.toFixed(2)}</span></div><button onClick={() => { setShowCart(false); setShowCheckout(true); }} disabled={cart.length === 0} className="w-full bg-green-600 text-white py-3 rounded-xl text-lg font-semibold disabled:opacity-50">Proceed to Checkout</button></div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Complete Order</h2>
            <form onSubmit={(e) => { e.preventDefault(); const name = e.target.name.value; const phone = e.target.phone.value; const address = e.target.address.value; if (!name || !phone) return alert('Name and phone are required'); placeOrder({ name, phone, address }); }}>
              <div className="mb-4"><label className="block text-gray-700 font-medium mb-1">Full Name *</label><input type="text" name="name" className="w-full border rounded-lg p-3" required /></div>
              <div className="mb-4"><label className="block text-gray-700 font-medium mb-1">Phone Number *</label><input type="tel" name="phone" className="w-full border rounded-lg p-3" required /></div>
              <div className="mb-4"><label className="block text-gray-700 font-medium mb-1">Delivery Address</label><textarea name="address" rows="2" className="w-full border rounded-lg p-3"></textarea></div>
              <div className="mb-5"><label className="block text-gray-700 font-medium mb-2">Payment Method</label><div className="flex gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} /><FaMoneyBillWave className="text-green-600" /> Cash</label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /><FaCreditCard className="text-blue-600" /> Card</label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="payment" value="paypal" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} /><FaPaypal className="text-blue-800" /> PayPal</label></div></div>
              <div className="flex gap-3"><button type="button" onClick={() => setShowCheckout(false)} className="flex-1 bg-gray-300 py-3 rounded-lg font-semibold">Cancel</button><button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold">Place Order</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const ProductCard = ({ product, onAdd }) => (
  <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
    <div className="h-32 bg-gray-200 flex items-center justify-center text-4xl">🍔</div>
    <div className="p-4">
      <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
      <p className="text-gray-500 text-sm mt-1">{product.texttip || 'Delicious item'}</p>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-2xl font-bold text-green-600">${parseFloat(product.pricesell).toFixed(2)}</span>
        <button onClick={() => onAdd(product)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md transition">Order Now</button>
      </div>
    </div>
  </div>
);

export default PDAPage;