import { Pool } from 'pg';

const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://auction_user:auction_pass@localhost:5432/auction_db'
});

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Create sample users
    const users = [
      { username: 'alice', email: 'alice@example.com', password_hash: 'hashed_password_1' },
      { username: 'bob', email: 'bob@example.com', password_hash: 'hashed_password_2' },
      { username: 'charlie', email: 'charlie@example.com', password_hash: 'hashed_password_3' }
    ];

    for (const user of users) {
      await db.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) ON CONFLICT (username) DO NOTHING',
        [user.username, user.email, user.password_hash]
      );
    }

    // Create sample items
    const items = [
      { name: 'Vintage Watch', description: 'A beautiful vintage watch from the 1950s', category: 'accessories' },
      { name: 'Rare Book', description: 'First edition of a classic novel', category: 'books' },
      { name: 'Antique Vase', description: 'Ming dynasty ceramic vase', category: 'antiques' }
    ];

    const itemIds = [];
    for (const item of items) {
      const result = await db.query(
        'INSERT INTO items (name, description, category) VALUES ($1, $2, $3) RETURNING id',
        [item.name, item.description, item.category]
      );
      itemIds.push(result.rows[0].id);
    }

    // Create sample auctions
    const now = new Date();
    const auctions = [
      {
        title: 'Vintage Watch Auction',
        description: 'Bidding for a rare vintage timepiece',
        starting_price: 100.00,
        start_time: now,
        end_time: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours from now
        status: 'active',
        item_id: itemIds[0]
      },
      {
        title: 'Rare Book Sale',
        description: 'First edition book auction',
        starting_price: 50.00,
        start_time: now,
        end_time: new Date(now.getTime() + 12 * 60 * 60 * 1000), // 12 hours from now
        status: 'active',
        item_id: itemIds[1]
      }
    ];

    for (const auction of auctions) {
      await db.query(
        'INSERT INTO auctions (title, description, starting_price, start_time, end_time, status, item_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [auction.title, auction.description, auction.starting_price, auction.start_time, auction.end_time, auction.status, auction.item_id]
      );
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await db.end();
  }
}

seedDatabase();