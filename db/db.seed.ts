import { drizzle } from 'drizzle-orm/libsql';
import { db as sqliteDb } from './db.config';
import { productsTable, salesTable } from './schema';

const db = drizzle(sqliteDb);

// Helper function to generate random dates within the last year
function getRandomDateLastYear() {
  const end = new Date();
  const start = new Date(end.getFullYear() - 1, end.getMonth(), end.getDate());
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
}

async function seed() {
  console.log('Seeding data...');

  try {
    // Basic cleanup before seeding!
    // Since we don't have constraints cascade yet, delete sales first to avoid FK constraints
    console.log('Cleaning up existing data...');
    await db.delete(salesTable);
    await db.delete(productsTable);

    // 1. Insert Products (50 items)
    const productData = [
      { name: 'Wireless Earbuds Pro', category: 'Electronics', price: 129.99, stock: 150 },
      { name: 'Ergonomic Mesh Chair', category: 'Furniture', price: 249.50, stock: 40 },
      { name: 'Cloud Running Shoes', category: 'Apparel', price: 115.00, stock: 85 },
      { name: 'Tactical Mechanical Keyboard', category: 'Electronics', price: 140.00, stock: 60 },
      { name: 'Smart Coffee Maker setup', category: 'Home Appliances', price: 199.99, stock: 25 },
      { name: 'Noise Cancelling Headphones', category: 'Electronics', price: 299.00, stock: 120 },
      { name: 'Adjustable Standing Desk', category: 'Furniture', price: 399.00, stock: 30 },
      { name: 'Yoga Mat Non-Slip', category: 'Fitness', price: 35.00, stock: 200 },
      { name: 'Stainless Steel Water Bottle', category: 'Accessories', price: 25.00, stock: 300 },
      { name: '4K Ultra HD Monitor', category: 'Electronics', price: 349.99, stock: 45 },
      { name: 'Gaming Mouse Pad XL', category: 'Accessories', price: 19.99, stock: 500 },
      { name: 'Bluetooth Portable Speaker', category: 'Electronics', price: 59.99, stock: 150 },
      { name: 'Electric Toothbrush', category: 'Personal Care', price: 89.99, stock: 90 },
      { name: 'Resistance Bands Set', category: 'Fitness', price: 22.50, stock: 400 },
      { name: 'LED Desk Lamp', category: 'Home Office', price: 45.00, stock: 120 },
      { name: 'Smartphone Tripod', category: 'Photography', price: 29.99, stock: 180 },
      { name: 'Wireless Charging Pad', category: 'Electronics', price: 39.99, stock: 250 },
      { name: 'Memory Foam Pillow', category: 'Home', price: 49.99, stock: 110 },
      { name: 'Cast Iron Skillet', category: 'Kitchen', price: 55.00, stock: 75 },
      { name: 'Air Fryer Max', category: 'Kitchen', price: 129.99, stock: 65 },
      { name: 'Dumbbell Set 20lb', category: 'Fitness', price: 65.00, stock: 40 },
      { name: 'Laptop Backpack Waterproof', category: 'Accessories', price: 75.00, stock: 140 },
      { name: 'Travel adapter Universal', category: 'Accessories', price: 24.99, stock: 450 },
      { name: 'Action Camera 4K', category: 'Photography', price: 199.99, stock: 55 },
      { name: 'Ring Light with Stand', category: 'Photography', price: 45.99, stock: 130 },
      { name: 'External Hard Drive 2TB', category: 'Electronics', price: 89.99, stock: 200 },
      { name: 'USB-C Hub Multiport', category: 'Electronics', price: 55.00, stock: 320 },
      { name: 'Smart Watch Series 5', category: 'Electronics', price: 249.99, stock: 85 },
      { name: 'Running Shorts Men', category: 'Apparel', price: 29.99, stock: 210 },
      { name: 'Sports Bra Women', category: 'Apparel', price: 34.99, stock: 190 },
      { name: 'Fleece Jacket', category: 'Apparel', price: 89.99, stock: 110 },
      { name: 'Winter Gloves Touchscreen', category: 'Apparel', price: 24.99, stock: 300 },
      { name: 'Sunglasses Polarized', category: 'Accessories', price: 49.99, stock: 150 },
      { name: 'Board Games Collection', category: 'Entertainment', price: 59.99, stock: 80 },
      { name: 'Puzzle 1000 Pieces', category: 'Entertainment', price: 19.99, stock: 220 },
      { name: 'Acoustic Guitar Bundle', category: 'Instruments', price: 199.00, stock: 20 },
      { name: 'Protein Powder Whey', category: 'Health', price: 45.00, stock: 300 },
      { name: 'Multivitamin Gummies', category: 'Health', price: 15.99, stock: 400 },
      { name: 'Essential Oil Diffuser', category: 'Home', price: 29.99, stock: 180 },
      { name: 'Scented Candles Set', category: 'Home', price: 35.00, stock: 140 },
      { name: 'Ceramic Coffee Mugs', category: 'Kitchen', price: 24.99, stock: 210 },
      { name: 'Chef Knife 8-inch', category: 'Kitchen', price: 65.00, stock: 90 },
      { name: 'Cutting Board Wood', category: 'Kitchen', price: 35.00, stock: 120 },
      { name: 'Electric Kettle Glass', category: 'Kitchen', price: 49.99, stock: 150 },
      { name: 'Blender High-Speed', category: 'Kitchen', price: 119.99, stock: 85 },
      { name: 'Vacuum Cleaner Cordless', category: 'Home Appliances', price: 199.99, stock: 60 },
      { name: 'Robot Vacuum', category: 'Home Appliances', price: 299.99, stock: 40 },
      { name: 'Humidifier Cool Mist', category: 'Home Appliances', price: 45.00, stock: 110 },
      { name: 'Space Heater Portable', category: 'Home Appliances', price: 55.00, stock: 190 },
      { name: 'Air Purifier HEPA', category: 'Home Appliances', price: 129.99, stock: 75 }
    ];

    const insertedProducts = await db.insert(productsTable).values(productData).returning({ id: productsTable.id, price: productsTable.price });
    console.log(`Products inserted: ${insertedProducts.length}`);

    // 2. Insert Sales (200 records over the last year)
    if (insertedProducts.length > 0) {
      const regions = ['North America', 'Europe', 'Asia', 'South America', 'Australia'];
      const customerNames = [
        'John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Brown', 'Charlie Davis',
        'Diana Miller', 'Evan Wilson', 'Fiona Moore', 'George Taylor', 'Hannah Anderson',
        'Ian Thomas', 'Julia Jackson', 'Kevin White', 'Laura Harris', 'Michael Martin',
        'Nina Thompson', 'Oliver Garcia', 'Paula Martinez', 'Quinn Robinson', 'Rachel Clark',
        'Sam Rodriguez', 'Tina Lewis', 'Ulysses Lee', 'Victoria Walker', 'William Hall',
        'Xenia Allen', 'Yusuf Young', 'Zara Hernandez', 'Adam King', 'Betty Wright',
        'Carl Lopez', 'Doris Hill', 'Edward Scott', 'Flora Green', 'Greg Adams',
        'Heather Baker', 'Isaac Gonzalez', 'Jackie Nelson', 'Kyle Carter', 'Linda Mitchell',
        'Mark Perez', 'Nancy Roberts', 'Oscar Turner', 'Penny Phillips', 'Ryan Campbell',
        'Sarah Parker', 'Tom Evans', 'Uma Edwards', 'Victor Collins', 'Wendy Stewart'
      ];

      const salesToInsert = [];

      for (let i = 0; i < 200; i++) {
        // Pick random product
        const productIndex = Math.floor(Math.random() * insertedProducts.length);
        const product = insertedProducts[productIndex];
        
        // Pick random quantity (1 to 5)
        const quantity = Math.floor(Math.random() * 5) + 1;
        const totalAmount = parseFloat((product.price * quantity).toFixed(2));
        
        // Pick random customer and region
        const customer = customerNames[Math.floor(Math.random() * customerNames.length)];
        const region = regions[Math.floor(Math.random() * regions.length)];
        
        // Pick random date within the last year
        const saleDate = getRandomDateLastYear();

        salesToInsert.push({
          product_id: product.id,
          quantity: quantity,
          total_amount: totalAmount,
          customer_name: customer,
          region: region,
          sale_date: saleDate
        });
      }

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
