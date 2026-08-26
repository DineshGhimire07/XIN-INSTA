'use client';

import React, { useState } from 'react';
import { Plus, Search, ExternalLink, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';

interface ProductItem {
  id: string;
  productCode: string;
  title: string;
  category: string;
  price: number;
  currency: string;
  imageUrl: string;
  productUrl: string;
  sizes: string[];
  keywords: string[];
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: '1',
    productCode: 'DRESS-001',
    title: 'Black Velvet Party Dress',
    category: 'Dresses',
    price: 3499,
    currency: 'NPR',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
    productUrl: 'https://your-store.com/products/black-velvet-dress',
    sizes: ['S', 'M', 'L'],
    keywords: ['black dress', 'velvet', 'party', 'cocktail'],
    status: 'IN_STOCK',
  },
  {
    id: '2',
    productCode: 'TEE-003',
    title: 'Graphic Oversized Crop Tee',
    category: 'Tees',
    price: 1850,
    currency: 'NPR',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
    productUrl: 'https://your-store.com/products/crop-tee-03',
    sizes: ['XS', 'S', 'M', 'L'],
    keywords: ['tee', 'crop', 'oversized', 'graphic'],
    status: 'IN_STOCK',
  },
  {
    id: '3',
    productCode: 'SET-012',
    title: 'Silky Co-ord Summer Set',
    category: 'Co-ords',
    price: 4200,
    currency: 'NPR',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
    productUrl: 'https://your-store.com/products/silk-coord-set',
    sizes: ['S', 'M'],
    keywords: ['set', 'silk', 'summer', 'coord'],
    status: 'LOW_STOCK',
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newKeywords, setNewKeywords] = useState('');

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newTitle || !newPrice) return;

    const newProd: ProductItem = {
      id: Date.now().toString(),
      productCode: newCode.toUpperCase(),
      title: newTitle,
      category: 'General',
      price: parseFloat(newPrice),
      currency: 'NPR',
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
      productUrl: newUrl || 'https://your-store.com/products/new-item',
      sizes: ['S', 'M', 'L'],
      keywords: newKeywords.split(',').map((k) => k.trim()).filter(Boolean),
      status: 'IN_STOCK',
    };

    setProducts([newProd, ...products]);
    setIsModalOpen(false);
    setNewCode('');
    setNewTitle('');
    setNewPrice('');
    setNewUrl('');
    setNewKeywords('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Products</h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Manage product catalog, keyword triggers, and direct checkout links
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm" className="gap-2">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Product SKU</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, SKU or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-surface border border-border-subtle rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-accent"
          />
        </div>
        <span className="text-xs text-foreground-muted">
          Showing {filteredProducts.length} of {products.length} products
        </span>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((p) => (
          <Card key={p.id} className="p-0 overflow-hidden group flex flex-col justify-between">
            {/* Image Preview */}
            <div className="relative h-48 w-full bg-surface-subtle overflow-hidden border-b border-border-subtle">
              <img
                src={p.imageUrl}
                alt={p.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
              />
              <div className="absolute top-3 left-3">
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-black/80 text-foreground border border-border-subtle">
                  {p.productCode}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <Badge
                  variant={
                    p.status === 'IN_STOCK'
                      ? 'success'
                      : p.status === 'LOW_STOCK'
                      ? 'warning'
                      : 'danger'
                  }
                  dot
                >
                  {p.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {/* Product Meta */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-foreground-muted">{p.category}</span>
                  <span className="font-semibold text-foreground font-mono tabular-nums">
                    {p.currency} {p.price.toLocaleString()}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-foreground mt-1 truncate">{p.title}</h3>

                {/* Keywords Pool */}
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {p.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-surface-subtle text-foreground-secondary border border-border-subtle"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                <span className="text-[11px] text-foreground-muted">Sizes: {p.sizes.join(', ')}</span>
                <a
                  href={p.productUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-foreground-secondary hover:text-foreground font-medium transition-colors"
                >
                  <span>Store Page</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Product SKU"
        description="Define a new product SKU to bind with social media content and automated responses."
      >
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="SKU Code"
              placeholder="e.g. DRESS-002"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              required
            />
            <Input
              label="Price (NPR)"
              type="number"
              placeholder="2999"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              required
            />
          </div>
          <Input
            label="Product Title"
            placeholder="Silk Evening Gown"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
          <Input
            label="Product Store URL"
            placeholder="https://your-store.com/products/item"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
          <Input
            label="Keywords (Comma separated)"
            placeholder="dress, silk, evening, gown"
            value={newKeywords}
            onChange={(e) => setNewKeywords(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Product SKU
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
