import React from 'react';

export default function ProductList({ query, category }) {
  return (
    <div className="space-y-3">
      <div className="product-card">
        <h3 className="text-sm font-bold text-white">iPhone 15 Pro Max</h3>
        <p className="text-xs text-slate-400">$1199 • Electronics</p>
      </div>
    </div>
  );
}