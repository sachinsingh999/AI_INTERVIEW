import React, { useState } from 'react';
import SearchBar from './components/SearchBar.jsx';
import ProductList from './components/ProductList.jsx';

export default function App() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-black text-indigo-400">Search Products</h1>
      <SearchBar query={query} setQuery={setQuery} category={category} setCategory={setCategory} />
      <ProductList query={query} category={category} />
    </div>
  );
}