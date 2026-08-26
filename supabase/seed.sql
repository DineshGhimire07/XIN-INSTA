-- Seed data for XINVORA Social Commerce Platform
INSERT INTO accounts (id, name, status)
VALUES ('a0000000-0000-0000-0000-000000000001', 'XINVORA Official', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, account_id, product_code, title, category, price, currency, product_url, image_url, available_sizes, keywords, inventory_status)
VALUES 
(
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'DRESS-001',
  'Black Velvet Party Dress',
  'Dresses',
  3499.00,
  'NPR',
  'https://your-store.com/products/black-velvet-dress',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
  ARRAY['S', 'M', 'L'],
  ARRAY['black dress', 'party dress', 'velvet', 'cocktail', 'dress'],
  'IN_STOCK'
),
(
  'b0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  'TEE-003',
  'Graphic Oversized Crop Tee',
  'Tees',
  1850.00,
  'NPR',
  'https://your-store.com/products/crop-tee-03',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
  ARRAY['XS', 'S', 'M', 'L'],
  ARRAY['tee', 'crop', 'oversized', 'graphic'],
  'IN_STOCK'
)
ON CONFLICT (account_id, product_code) DO NOTHING;

INSERT INTO automations (id, account_id, name, is_global, trigger_type, status)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Global Reel Product Request Link',
  TRUE,
  'COMMENT',
  'ACTIVE'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO response_pools (id, automation_id, name, responses, selection_strategy)
VALUES (
  'd0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'General Product Inquiries',
  ARRAY[
    'Sent you the details! Check your DMs 💌',
    'Just dropped the link in your inbox! ✨',
    'Check your messages for the direct product link! 🛍️',
    'Details sent! Let us know if you need help with sizing 💕'
  ],
  'RANDOM_AVOID_REPEAT'
)
ON CONFLICT (id) DO NOTHING;
