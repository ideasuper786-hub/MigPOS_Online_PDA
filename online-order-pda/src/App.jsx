import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

function App() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);

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
          setProducts(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Products error:', err);
          setLoading(false);
        });
    }
  }, [selectedCategory]);

  // Cart functions
  const addToCart = (product) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">🍕</span>
            <h1 className="text-2xl font-bold text-gray-800">Quick Order</h1>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full shadow-lg transition flex items-center gap-2"
          >
            🛒 Cart
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="sticky top-[73px] z-10 bg-white border-b border-gray-200 overflow-x-auto whitespace-nowrap shadow-sm">
        <div className="container mx-auto flex justify-start md:justify-center px-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-3 text-base font-medium transition-all duration-200 ${
                selectedCategory === cat.id
                  ? 'border-b-4 border-blue-600 text-blue-700 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <main className="container mx-auto p-4 pb-28">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{product.texttip || 'Delicious item'}</p>
                  <div className="mt-5 flex justify-between items-center">
                    <span className="text-2xl font-extrabold text-green-600">
                      ${parseFloat(product.pricesell).toFixed(2)}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md transition"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-800">Your Order</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700 text-3xl">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-gray-400 py-10">Cart is empty</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">${item.pricesell} each</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 bg-gray-200 rounded-full text-lg font-bold">-</button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 bg-gray-200 rounded-full text-lg font-bold">+</button>
                      <button onClick={() => removeItem(item.id)} className="ml-2 text-red-500 text-xl">🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-5 border-t bg-gray-50">
              <div className="flex justify-between text-xl font-bold mb-4">
                <span>Total:</span>
                <span className="text-green-600">${cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={() => setShowCheckout(true)}
                disabled={cart.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg font-semibold disabled:opacity-50 transition"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Complete Order</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const name = e.target.name.value;
              const phone = e.target.phone.value;
              const address = e.target.address.value;
              if (!name || !phone) {
                alert('Name and phone are required');
                return;
              }
              handleCheckout({ name, phone, address });
            }}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Full Name *</label>
                <input type="text" name="name" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Phone Number *</label>
                <input type="tel" name="phone" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="mb-5">
                <label className="block text-gray-700 font-medium mb-1">Delivery Address</label>
                <textarea name="address" rows="2" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCheckout(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold transition">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition">Place Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;