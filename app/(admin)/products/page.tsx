'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, ExternalLink, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';

interface ProductItem {
  id: string;
  product_code: string;
  title: string;
  category: string;
  price: number;
  currency: string;
  image_url: string;
  product_url: string;
  available_sizes: string[];
  keywords: string[];
  inventory_status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New product form state
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Dresses');
  const [newUrl, setNewUrl] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newKeywords, setNewKeywords] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.product_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.keywords && p.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newTitle || !newPrice) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productCode: newCode.toUpperCase().trim(),
          title: newTitle.trim(),
          category: newCategory.trim(),
          price: parseFloat(newPrice),
          currency: 'NPR',
          imageUrl: newImage.trim() || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
          productUrl: newUrl.trim() || 'https://xinvora.com',
          sizes: ['S', 'M', 'L'],
          keywords: newKeywords.split(',').map((k) => k.trim()).filter(Boolean),
          status: 'IN_STOCK',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setNewCode('');
        setNewTitle('');
        setNewPrice('');
        setNewUrl('');
        setNewImage('');
        setNewKeywords('');
        fetchProducts();
      }
    } catch (err) {
      console.error('Failed to add product:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Products Catalog</h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Manage your real product catalog, keyword triggers, and direct Instagram checkout cards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={fetchProducts} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setIsModalOpen(true)} size="sm" className="gap-2">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product SKU</span>
          </Button>
        </div>
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
      {isLoading ? (
        <div className="py-16 text-center text-xs text-foreground-muted">Loading products from database...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-surface-subtle/50 rounded-xl border border-border-subtle space-y-3">
          <p className="text-xs text-foreground-secondary">No products found. Click Add Product SKU above to create your first product.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((p) => (
            <Card key={p.id} className="p-0 overflow-hidden group flex flex-col justify-between">
              {/* Image Preview */}
              <div className="relative h-48 w-full bg-surface-subtle overflow-hidden border-b border-border-subtle">
                <img
                  src={p.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800'}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-black/80 text-foreground border border-border-subtle">
                    {p.product_code}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge
                    variant={
                      p.inventory_status === 'IN_STOCK'
                        ? 'success'
                        : p.inventory_status === 'LOW_STOCK'
                        ? 'warning'
                        : 'danger'
                    }
                    dot
                  >
                    {p.inventory_status ? p.inventory_status.replace('_', ' ') : 'ACTIVE'}
                  </Badge>
                </div>
              </div>

              {/* Product Meta */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-medium text-foreground-muted">{p.category}</span>
                    <span className="font-semibold text-foreground font-mono tabular-nums">
                      {p.currency} {Number(p.price).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-foreground mt-1 truncate">{p.title}</h3>

                  {/* Keywords Pool */}
                  {p.keywords && p.keywords.length > 0 && (
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
                  )}
                </div>

                {/* Action Bar */}
                <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                  <span className="text-[11px] text-foreground-muted">
                    Sizes: {p.available_sizes ? p.available_sizes.join(', ') : 'All'}
                  </span>
                  <a
                    href={p.product_url}
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
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Product SKU"
        description="Define a new product SKU to bind with your Instagram Reels and automated DM cards."
      >
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="SKU Code"
              placeholder="e.g. XIN-001"
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
            placeholder="Signature Silk Party Dress"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
          <Input
            label="Category"
            placeholder="Dresses, Tops, Shoes..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <Input
            label="Product Store URL"
            placeholder="https://xinvora.com/products/item"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
          <Input
            label="Image URL"
            placeholder="https://images.unsplash.com/..."
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
          />
          <Input
            label="Keywords (Comma separated for DM triggers)"
            placeholder="price, cost, buy, link, dm, dress"
            value={newKeywords}
            onChange={(e) => setNewKeywords(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Saving to Database...' : 'Save Product SKU'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
