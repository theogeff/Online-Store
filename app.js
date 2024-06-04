'use strict';

/**
 * Theo Gefflaut
 * May 12th, 2024
 * Section AB  Elias Belzberg and Quinton Pharr
 *
 * This JavaScript file sets up a server for handling requests about logging in, creating an
 * account, loading in products, using the cart, and placing orders. It defines all the necessary
 * endpoints for these requests, and ensures that the data is accessed and stored correctly through
 * a SQLite database.
 */

const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const session = require('express-session');
const sqlite = require('sqlite');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: false, // Set to true if using HTTPS
    httpOnly: true
  }
}));

/**
 * Establishes a database connection to the database and returns the database object.
 * Any errors that occur should be caught in the function that calls this one.
 * @returns {Object} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'bakery.db',
    driver: sqlite3.Database
  });
  return db;
}

/**
 * Registers a new user into the database.
 */
app.post('/api/register', async (req, res) => {
  let { username, email, password } = req.body;

  try {
    let hashedPassword = await bcrypt.hash(password, 10);
    let db = await getDBConnection();
    let result = await db.run(`INSERT INTO users (username, email, hashedPassword) VALUES (?, ?, ?)`,
      [username, email, hashedPassword]);
    let user_id = result.lastID;
    await db.close();
    console.log("2. Inserted user in db");
    res.status(200).json({ message: 'User registered successfully', user_id: user_id });
    console.log("Sent 200 error");
  } catch (err) {
    console.error('Error inserting user:', err.message);
    res.status(500).json({ error: 'Failed to register user' });
    console.log("Sent 500 error");
  }
});

/**
 * Logs in an existing user.
 */
app.post('/api/login', async (req, res) => {
  let { username, password } = req.body;

  try {
    let db = await getDBConnection();
    let user = await db.get(`SELECT * FROM users WHERE username = ?`, [username]);
    if (!user) {
      await db.close();
      return res.status(401).json({ error: 'Username not found' });
    }
    let isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      await db.close();
      return res.status(401).json({ error: 'Incorrect password' });
    }
    req.session.user_id = user.user_id; // Store user_id in session
    console.log(user.user_id);
    await db.close();
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error('Error during login:', err.message);
    res.status(500).json({ error: 'Failed to login user' });
  }
});

/**
 * Retrieves all the products associated with a specific category.
 */
app.get('/api/products/:category', async (req, res) => {
  let category = req.params.category;
  let db = await getDBConnection();

  try {
    let rows = await db.all('SELECT * FROM products WHERE category = ?', [category]);
    res.json(rows);
  } catch (err) {
    console.error('Error retrieving products data:', err.message);
    res.status(500).send('Error retrieving products data');
  } finally {
    await db.close();
  }
});

/**
 * Adds an item to the cart.
 */
app.post('/api/cart', async (req, res) => {
  let { product_id, quantity } = req.body;
  let user_id = req.session.user_id; // Get the user_id from the session

  if (!user_id) {
    return res.status(401).json({ error: 'User not logged in' });
  }

  try {
    let db = await getDBConnection();
    await db.run(`INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)`,
      [user_id, product_id, quantity]);
    await db.close();
    res.json({ message: 'Item added to cart', product_id: product_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Retrieves all the cart items for the logged-in user.
 */
app.get('/api/cart', async (req, res) => {
  let user_id = req.session.user_id; // Get the user_id from the session

  console.log(user_id);
  if (!user_id) {
    return res.status(401).json({ error: 'User not logged in' });
  }

  try {
    let db = await getDBConnection();
    let rows = await db.all(`SELECT cart.cart_item_id as cart_item_id, products.name, products.price, cart.quantity
                             FROM cart
                             JOIN products ON cart.product_id = products.id
                             WHERE cart.user_id = ?`, [user_id]);
    await db.close();
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Retrieves details of a product by ID.
 */
app.get('/api/product/:id', async (req, res) => {
  let productId = req.params.id;
  let db = await getDBConnection();

  try {
    let row = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await db.close();
  }
});

/**
 * Clears the cart for the logged-in user.
 */
app.delete('/api/cart', async (req, res) => {
  let user_id = req.session.user_id; // Get the user_id from the session

  if (!user_id) {
    return res.status(401).json({ error: 'User not logged in' });
  }

  try {
    let db = await getDBConnection();
    await db.run(`DELETE FROM cart WHERE user_id = ?`, [user_id]);
    await db.close();
    res.status(200).json({ message: 'Your cart is empty' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Updates the quantity of an item in the cart.
 */
app.put('/api/cart/:id', async (req, res) => {
  let cartItemId = req.params.id;
  let { quantity } = req.body;

  try {
    let db = await getDBConnection();
    await db.run(`UPDATE cart SET quantity = ? WHERE cart_item_id = ?`,
      [quantity, cartItemId]);
    await db.close();
    res.json({ message: 'Cart item quantity updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Removes an item in the cart.
 */
app.delete('/api/cart/:id', async (req, res) => {
  let cartItemId = req.params.id;

  try {
    let db = await getDBConnection();
    await db.run(`DELETE FROM cart WHERE cart_item_id = ?`, [cartItemId]);
    await db.close();
    res.json({ message: 'Cart item removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Places an order.
 */
app.post('/api/order', async (req, res) => {
  let user_id = req.session.user_id; // Get the user_id from the session
  let { pickup_date, pickup_time } = req.body;
  console.log(user_id);

  // Check if the time is within the allowed range
  let [hours, minutes] = pickup_time.split(':').map(Number);
  if (hours < 8 || hours > 16 || (hours === 16 && minutes > 0)) {
    return res.status(400).json({ error: 'Pickup time must be between 8:00 AM and 4:00 PM.' });
  }

  // Generate a confirmation code
  let confirmationCode = crypto.randomBytes(4).toString('hex');

  let db = await getDBConnection();
  let now = new Date().toISOString();

  try {
    let result = await db.run(`INSERT INTO orders (user_id, order_date, status, total_price, confirmation_code)
                  VALUES (?, ?, ?, ?, ?)`, [user_id, now, 'Pending', 0, confirmationCode]);

    let order_id = result.lastID;
    console.log("Order_id: " + order_id);

    let cartItems = await db.all(`SELECT cart.product_id, cart.quantity, products.price
                                  FROM cart
                                  JOIN products ON cart.product_id = products.id
                                  WHERE cart.user_id = ?`, [user_id]);

    let totalPrice = 0;
    for (let item of cartItems) {
      totalPrice += item.quantity * item.price;
      await db.run(`INSERT INTO order_items (order_id, product_id, quantity, price)
                    VALUES (?, ?, ?, ?)`, [order_id, item.product_id, item.quantity, item.price]);
    }
    console.log('cartItems insert');
    await db.run(`UPDATE orders SET total_price = ? WHERE order_id = ?`, [totalPrice, order_id]);
    await db.run(`DELETE FROM cart WHERE user_id = ?`, [user_id]);

    res.status(200).json({ message: 'Order placed successfully!', confirmation_code: confirmationCode });
  } catch (err) {
    console.error('Error placing order:', err.message);
    res.status(500).json({ error: 'Failed to place order' });
  } finally {
    await db.close();
  }
});

/**
 * Verifies the login status of the user.
 */
app.get('/api/login-status', async (req, res) => {
  if (req.session.user_id) {
    let db = await getDBConnection();

    try {
      let row = await db.get(`SELECT username FROM users WHERE user_id = ?`, [req.session.user_id]);
      res.json({ loggedIn: true, username: row.username });
    } catch (err) {
      console.error('Error retrieving user info:', err.message);
      res.status(500).json({ error: err.message });
    } finally {
      await db.close();
    }
  } else {
    res.json({ loggedIn: false });
  }
});

/**
 * Retrieves the order history for the logged-in user.
 */
app.get('/api/order-history', async (req, res) => {
  let user_id = req.session.user_id; // Get the user_id from the session

  if (!user_id) {
    return res.status(401).json({ error: 'User not logged in' });
  }

  let db = await getDBConnection();

  try {
    let rows = await db.all(`
      SELECT orders.order_id, orders.order_date, orders.status, orders.confirmation_code,
             SUM(order_items.quantity * order_items.price) AS total_price,
             GROUP_CONCAT(products.name || ' x ' || order_items.quantity, ', ') as items
      FROM orders
      JOIN order_items ON orders.order_id = order_items.order_id
      JOIN products ON order_items.product_id = products.id
      WHERE orders.user_id = ?
      GROUP BY orders.order_id
      ORDER BY orders.order_date DESC`, [user_id]);
    res.json(rows);
  } catch (err) {
    console.error('Error retrieving order history:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    await db.close();
  }
});

/**
 * Searches through products based on a search term.
 */
app.get('/api/search', async (req, res) => {
  let searchTerm = `%${req.query.term}%`;

  try {
    let db = await getDBConnection();
    let rows = await db.all(`
      SELECT MIN(id) as id, name, price, img_url, availability, category
      FROM products
      WHERE name LIKE ? OR price LIKE ? OR category LIKE ? OR availability LIKE ?
      GROUP BY name, price, img_url, availability`, [searchTerm, searchTerm, searchTerm, searchTerm]);
    await db.close();
    res.json(rows);
  } catch (err) {
    console.error('Error searching products:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Logs out the user.
 */
app.post('/api/logout', (req, res) => {
  console.log("Session destroyed");
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

/**
 * Handles adding the information from the contact form into the database.
 */
app.post('/api/contact', async (req, res) => {
  let { firstName, lastName, email, message } = req.body;

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  let emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailCheck.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  let submissionDate = new Date().toISOString();
  let db = await getDBConnection();

  try {
    await db.run(`INSERT INTO contact_messages (first_name, last_name, email, message, submission_date)
                  VALUES (?, ?, ?, ?, ?)`, [firstName, lastName, email, message, submissionDate]);
    res.status(201).json({ message: 'Contact message saved successfully' });
  } catch (err) {
    console.error('Error saving contact message:', err.message);
    res.status(500).json({ error: 'Failed to save contact message' });
  } finally {
    await db.close();
  }
});

// Start the server at the bottom of the file.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
