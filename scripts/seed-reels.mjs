import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'aws-0-ap-southeast-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.zhmmwztavxglltomkgdy',
  password: '*J@9wvK/36^HAEt',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function seedReels() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL...');

  const chanRes = await client.query('SELECT id FROM channels LIMIT 1');
  let channelId = chanRes.rows[0]?.id;

  if (!channelId) {
    const accRes = await client.query('SELECT id FROM accounts LIMIT 1');
    const accId = accRes.rows[0]?.id || 'a0000000-0000-0000-0000-000000000001';
    const newChan = await client.query(
      "INSERT INTO channels (account_id, platform, platform_account_id, handle) VALUES ($1, 'INSTAGRAM', 'ig_xinvora_main', '@xinvora') RETURNING id",
      [accId]
    );
    channelId = newChan.rows[0].id;
  }

  const sampleReels = [
    {
      platform_content_id: 'reel_42',
      content_type: 'REEL',
      permalink: 'https://instagram.com/reel/C8jKl2xM91',
      caption: 'Our viral Black Velvet Party Dress is back in stock! ✨ Drop LINK or PRICE below for instant priority checkout access 🛍️ #xinvora #nepalfashion',
      media_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
    },
    {
      platform_content_id: 'reel_43',
      content_type: 'REEL',
      permalink: 'https://instagram.com/reel/C8lNx54P32',
      caption: 'Pure Cashmere Oversized Winter Knit ❄️ Comment KATI to get the price and sizing card in your DMs!',
      media_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
    },
    {
      platform_content_id: 'reel_44',
      content_type: 'REEL',
      permalink: 'https://instagram.com/reel/C8qYz99K11',
      caption: 'Emerald Satin Evening Gown — hand-tailored luxury for your wedding season ✨ Comment SHOP for link!',
      media_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
    },
    {
      platform_content_id: 'post_101',
      content_type: 'POST',
      permalink: 'https://instagram.com/p/C8uRt12J99',
      caption: 'Weekend Outfit Inspiration 👗 Tap our bio link or comment LOOK for the whole set breakdown!',
      media_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
    }
  ];

  for (const r of sampleReels) {
    await client.query(
      `INSERT INTO content_items (channel_id, platform_content_id, content_type, permalink, caption, media_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (channel_id, platform_content_id) DO UPDATE SET caption = EXCLUDED.caption, media_url = EXCLUDED.media_url`,
      [channelId, r.platform_content_id, r.content_type, r.permalink, r.caption, r.media_url]
    );
  }

  console.log('✓ Successfully seeded Instagram Reels into content_items table!');
  await client.end();
}

seedReels().catch(console.error);
