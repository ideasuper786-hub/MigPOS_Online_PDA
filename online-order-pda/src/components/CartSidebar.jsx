import React from 'react';

export default function CartSidebar({ cart, onUpdateQuantity, onRemove, total, onCheckout, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-xl">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Cart</h2>
          <button onClick={onClose} className="text-gray-500 text-2xl">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <p className="text-center text-gray-400">Cart is empty</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b pb-2">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">${item.pricesell} each</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-8 h-8 bg-gray-200 rounded-full">-</button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-8 h-8 bg-gray-200 rounded-full">+</button>
                  <button onClick={() => onRemove(item.id)} className="ml-2 text-red-500">🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t">
          <div className="flex justify-between text-xl font-bold mb-4">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            onClick={onCheckout}
            disabled={cart.length === 0}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-full text-lg font-semibold disabled:opacity-50"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}