import React, { useState } from 'react';

export default function CheckoutModal({ total, onSubmit, onClose }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Name and phone are required');
      return;
    }
    onSubmit({ name, phone, address });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Checkout</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block mb-1">Name *</label>
            <input type="text" className="w-full border rounded-lg p-2" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="block mb-1">Phone *</label>
            <input type="tel" className="w-full border rounded-lg p-2" value={phone} onChange={e => setPhone(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Address</label>
            <textarea className="w-full border rounded-lg p-2" rows="2" value={address} onChange={e => setAddress(e.target.value)}></textarea>
          </div>
          <div className="text-xl font-bold mb-4 text-right">Total: ${total.toFixed(2)}</div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 py-2 rounded-lg">Cancel</button>
            <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded-lg">Place Order</button>
          </div>
        </form>
      </div>
    </div>
  );
}