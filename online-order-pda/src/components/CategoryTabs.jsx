import React from 'react';

export default function ProductGrid({ products, onAddToCart }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <div key={product.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition">
          <div className="p-4">
            <h3 className="text-xl font-semibold">{product.name}</h3>
            <p className="text-gray-500 text-sm mt-1">{product.texttip}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-2xl font-bold text-green-600">
                ${parseFloat(product.pricesell).toFixed(2)}
              </span>
              <button
                onClick={() => onAddToCart(product)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm"
              >
                + Add
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}