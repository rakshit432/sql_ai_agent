import { drizzle } from 'drizzle-orm/libsql';
import { db as sqliteDb } from './db.config';
import { productsTable, salesTable } from './schema';

const db = drizzle(sqliteDb);

async function seed() {
  console.log('Seeding data...');

  try {
    // 1. Insert Products
    const insertedProducts = await db.insert(productsTable).values([
      { name: 'Wireless Earbuds', category: 'Electronics', price: 49.99, stock: 100 },
      { name: 'Ergonomic Chair', category: 'Furniture', price: 199.50, stock: 20 },
      { name: 'Running Shoes', category: 'Apparel', price: 85.00, stock: 50 },
      { name: 'Mechanical Keyboard', category: 'Electronics', price: 120.00, stock: 35 },
      { name: 'Coffee Maker', category: 'Home Appliances', price: 79.99, stock: 15 },
    ]).returning({ id: productsTable.id });

    console.log(`Products inserted: ${insertedProducts.length}`);

    // 2. Insert Sales
    if (insertedProducts.length > 0) {
      const salesToInsert = [
        {
          product_id: insertedProducts[0].id,
          quantity: 2,
          total_amount: 99.98,
          customer_name: 'John Doe',
          region: 'North America',
        },
        {
          product_id: insertedProducts[1].id,
          quantity: 1,
          total_amount: 199.50,
          customer_name: 'Jane Smith',
          region: 'Europe',
        },
        {
          product_id: insertedProducts[2].id,
          quantity: 3,
          total_amount: 255.00,
          customer_name: 'Alice Johnson',
          region: 'Asia',
        },
        {
          product_id: insertedProducts[3].id,
          quantity: 1,
          total_amount: 120.00,
          customer_name: 'Bob Brown',
          region: 'North America',
        },
        {
          product_id: insertedProducts[4].id,
          quantity: 2,
          total_amount: 159.98,
          customer_name: 'Charlie Davis',
          region: 'Europe',
        }
      ];

      const insertedSales = await db.insert(salesTable).values(salesToInsert).returning({ id: salesTable.id });
      console.log(`Sales inserted: ${insertedSales.length}`);
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
