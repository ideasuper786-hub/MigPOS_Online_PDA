import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaShoppingCart, FaTrash, FaPlus, FaMinus, FaHeart, FaClock, FaFire } from 'react-icons/fa';

const API_BASE = 'http://127.0.0.1:8000/api';

// Map category names to emoji icons
const getCategoryIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('burger')) return '🍔';
  if (n.includes('pizza')) return '🍕';
  if (n.includes('dessert')) return '🍰';
  if (n.includes('drink')) return '🥤';
  if (n.includes('fruit')) return '🍎';
  if (n.includes('fast')) return '🍟';
  return '🍽️';
};

function App() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Load categories
  useEffect(() => {
    axios.get(`${API_BASE}/categories`)
      .then(res => {
        setCategories(res.data);
        if (res.data.length) setSelectedCategory(res.data[0].id);
      })
      .catch(err => console.error('Categories error:', err));
  }, []);

  // Load products when category changes
  useEffect(() => {
    if (selectedCategory) {
      setLoading(true);
      axios.get(`${API_BASE}/products/category/${selectedCategory}`)
        .then(res => {
          console.log('Products loaded:', res.data);
          setProducts(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Products error:', err);
          setLoading(false);
        });
    }
  }, [selectedCategory]);

  // Load recently viewed
  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) setRecentlyViewed(JSON.parse(stored));
  }, []);

  const addToRecentlyViewed = (product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      const newList = [product, ...filtered].slice(0, 6);
      localStorage.setItem('recentlyViewed', JSON.stringify(newList));
      return newList;
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.texttip && product.texttip.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  const handleCheckout = (customerData) => {
    const payload = {
      customer_name: customerData.name,
      customer_phone: customerData.phone,
      customer_address: customerData.address,
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }))
    };
    axios.post(`${API_BASE}/order`, payload)
      .then(res => {
        alert(`✅ ${res.data.message}\nOrder #${res.data.order_id}`);
        setCart([]);
        setShowCheckout(false);
        setShowCart(false);
      })
      .catch(err => {
        console.error(err);
        alert('❌ Order failed: ' + (err.response?.data?.message || err.message));
      });
  };

  const promotions = [
    { title: 'Free Pizza', subtitle: '1 + 1 = 1', bg: 'bg-red-500' },
    { title: 'Combo Set', subtitle: 'Only $10', bg: 'bg-yellow-500' },
    { title: 'New donuts', subtitle: 'Just $0.99', bg: 'bg-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Seven Burger</h1>
          <button onClick={() => setShowCart(true)} className="relative text-gray-700 hover:text-blue-600">
            <FaShoppingCart className="text-2xl" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Promotions */}
      <div className="container mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {promotions.map((promo, idx) => (
            <div key={idx} className={`${promo.bg} rounded-2xl p-4 text-white shadow-lg`}>
              <h3 className="text-xl font-bold">{promo.title}</h3>
              <p className="text-sm opacity-90">{promo.subtitle}</p>
              <button className="mt-3 bg-white text-gray-800 px-4 py-1 rounded-full text-sm font-semibold">
                Order Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 mt-8">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Categories - ROUND CARDS */}
      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl shadow-md transition-all duration-200 ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white scale-105'
                  : 'bg-white text-gray-700 hover:bg-blue-50 hover:shadow-lg'
              }`}
            >
              <span className="text-4xl mb-2">{getCategoryIcon(cat.name)}</span>
              <span className="text-sm font-medium">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Top of the week */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FaHeart className="text-red-500" /> Top of the week
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : topOfWeek.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No items available</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {topOfWeek.map(product => (
                <ProductCard key={product.id} product={product} onAdd={addToCart} />
              ))}
            </div>
          )}
        </section>

        {/* Popular Now */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FaFire className="text-orange-500" /> Popular Now
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : popularNow.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No items available</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {popularNow.map(product => (
                <ProductCard key={product.id} product={product} onAdd={addToCart} />
              ))}
            </div>
          )}
        </section>

        {/* All products from selected category */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            {categories.find(c => c.id === selectedCategory)?.name || 'Menu'} Items
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No products found in this category</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} onAdd={addToCart} />
              ))}
            </div>
          )}
        </section>

        {/* Recently viewed */}
        {recentlyViewed.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaClock className="text-blue-500" /> Recently viewed
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recentlyViewed.map(product => (
                <ProductCard key={product.id} product={product} onAdd={addToCart} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Seven Burger</h3>
              <p className="text-gray-400">Delicious food delivered fast.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <p className="text-gray-400">📍 123 Burger Street, Food City</p>
              <p className="text-gray-400">📞 +1 234 567 890</p>
              <p className="text-gray-400">✉️ info@sevenburger.com</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400">
            &copy; 2025 Seven Burger. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Cart Sidebar & Checkout Modal (same as before) */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-in">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-2xl font-bold flex items-center gap-2"><FaShoppingCart /> Your Order</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-500 text-3xl">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-gray-400 py-10">Cart is empty</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-3">
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-500">${item.pricesell} each</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"><FaMinus /></button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"><FaPlus /></button>
                      <button onClick={() => removeItem(item.id)} className="text-red-500"><FaTrash /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-5 border-t bg-gray-50">
              <div className="flex justify-between text-xl font-bold mb-4">
                <span>Total:</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={() => setShowCheckout(true)}
                disabled={cart.length === 0}
                className="w-full bg-green-600 text-white py-3 rounded-xl text-lg font-semibold disabled:opacity-50"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Complete Order</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const name = e.target.name.value;
              const phone = e.target.phone.value;
              const address = e.target.address.value;
              if (!name || !phone) return alert('Name and phone are required');
              handleCheckout({ name, phone, address });
            }}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Full Name *</label>
                <input type="text" name="name" className="w-full border rounded-lg p-3" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Phone Number *</label>
                <input type="tel" name="phone" className="w-full border rounded-lg p-3" required />
              </div>
              <div className="mb-5">
                <label className="block text-gray-700 font-medium mb-1">Delivery Address</label>
                <textarea name="address" rows="2" className="w-full border rounded-lg p-3"></textarea>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCheckout(false)} className="flex-1 bg-gray-300 py-3 rounded-lg font-semibold">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold">Place Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const ProductCard = ({ product, onAdd }) => (
  <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
    <div className="h-32 bg-gray-200 flex items-center justify-center text-4xl">
      🍔
    </div>
    <div className="p-4">
      <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
      <p className="text-gray-500 text-sm mt-1">{product.texttip || 'Delicious item'}</p>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-2xl font-bold text-green-600">
          ${parseFloat(product.pricesell).toFixed(2)}
        </span>
        <button
          onClick={() => onAdd(product)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md transition"
        >
          Order Now
        </button>
      </div>
    </div>
  </div>
);

export default App;