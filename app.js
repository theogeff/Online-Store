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
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const session = require('express-session');
const sqlite = require('sqlite');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const DFLT_PORT = 3000;
const SIXTY = 60;
const TWENTY_FOUR = 24;
const ONE_THOUSAND = 1000;
const SERVER_ERROR = 500;
const LOGIN_ERROR = 401;
const BAD_REQUEST = 400;
const GOOD_CREATE = 201;
const OK_CODE = 200;
const OPENING_TIME = 8;
const CLOSING_TIME = 16;
const BYTES = 4;

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: TWENTY_FOUR * SIXTY * SIXTY * ONE_THOUSAND, // 24 hours
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

// Registers a new user into the database.
app.post('/api/register', async (req, res) => {
  let {username, email, password} = req.body;
  const SALT_VALUE = 10;
  try {
    let hashedPassword = await bcrypt.hash(password, SALT_VALUE);
    let db = await getDBConnection();
    let result = await db.run(
      `INSERT INTO users (username, email, hashedPassword) VALUES (?, ?, ?)`,
      [username, email, hashedPassword]
    );
    let userId = result.lastID;
    await db.close();
    res.status(OK_CODE).json({message: 'User registered successfully', userId: userId});
  } catch (err) {
    console.error('Error inserting user:', err.message);
    res.status(SERVER_ERROR).json({error: 'Failed to register user'});
  }
});

// Logs in an existing user.
app.post('/api/login', async (req, res) => {
  let {username, password} = req.body;

  try {
    let db = await getDBConnection();
    let user = await db.get(`SELECT * FROM users WHERE username = ?`, [username]);
    if (!user) {
      await db.close();
      return res.status(LOGIN_ERROR).json({error: 'Username not found'});
    }
    let isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      await db.close();
      return res.status(LOGIN_ERROR).json({error: 'Incorrect password'});
    }
    req.session.userId = user.userId; // Store userId in session
    await db.close();
    res.status(OK_CODE).json({message: 'Login successful'});
  } catch (err) {
    console.error('Error during login:', err.message);
    res.status(SERVER_ERROR).json({error: 'Failed to login user'});
  }
});

// Retrieves all the products associated with a specific category.
app.get('/api/products/:category', async (req, res) => {
  let category = req.params.category;
  let db = await getDBConnection();

  try {
    let rows = await db.all('SELECT * FROM products WHERE category = ?', [category]);
    res.json(rows);
  } catch (err) {
    console.error('Error retrieving products data:', err.message);
    res.status(SERVER_ERROR).send('Error retrieving products data');
  }
  await db.close();
});

// Adds an item to the cart.
app.post('/api/cart', async (req, res) => {
  let {productId, quantity} = req.body;
  let userId = req.session.userId; // Get the userId from the session

  if (!userId) {
    return res.status(LOGIN_ERROR).json({error: 'User not logged in'});
  }

  try {
    let db = await getDBConnection();
    await db.run(
      `INSERT INTO cart (userId, productId, quantity) VALUES (?, ?, ?)`,
      [userId, productId, quantity]
    );
    await db.close();
    res.json({message: 'Item added to cart', productId: productId});
  } catch (err) {
    res.status(SERVER_ERROR).json({error: err.message});
  }
});

// Retrieves all the cart items for the logged-in user.
app.get('/api/cart', async (req, res) => {
  let userId = req.session.userId; // Get the userId from the session

  if (!userId) {
    return res.status(LOGIN_ERROR).json({error: 'User not logged in'});
  }

  try {
    let db = await getDBConnection();
    let rows = await db.all(`SELECT cart.cartItemId as cartItemId, products.name, products.price,
                            cart.quantity
                             FROM cart
                             JOIN products ON cart.productId = products.id
                             WHERE cart.userId = ?`, [userId]);
    await db.close();
    res.json(rows || []);
  } catch (err) {
    res.status(SERVER_ERROR).json({error: err.message});
  }
});

// Retrieves details of a product by ID
app.get('/api/product/:id', async (req, res) => {
  let productId = req.params.id;
  let db = await getDBConnection();

  try {
    let row = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    res.json(row);
  } catch (err) {
    res.status(SERVER_ERROR).json({error: err.message});
  }
  await db.close();
});

// Clears the cart for the logged-in user.
app.delete('/api/cart', async (req, res) => {
  let userId = req.session.userId; // Get the userId from the session

  if (!userId) {
    return res.status(LOGIN_ERROR).json({error: 'User not logged in'});
  }

  try {
    let db = await getDBConnection();
    await db.run(`DELETE FROM cart WHERE userId = ?`, [userId]);
    await db.close();
    res.status(OK_CODE).json({message: 'Your cart is empty'});
  } catch (err) {
    res.status(SERVER_ERROR).json({error: err.message});
  }
});

// Updates the quantity of an item in the cart
app.put('/api/cart/:id', async (req, res) => {
  let cartItemId = req.params.id;
  let {quantity} = req.body;

  try {
    let db = await getDBConnection();
    await db.run(
      `UPDATE cart SET quantity = ? WHERE cartItemId = ?`,
      [quantity, cartItemId]
    );
    await db.close();
    res.json({message: 'Cart item quantity updated successfully'});
  } catch (err) {
    res.status(SERVER_ERROR).json({error: err.message});
  }
});

// Removes an item in the cart.
app.delete('/api/cart/:id', async (req, res) => {
  let cartItemId = req.params.id;

  try {
    let db = await getDBConnection();
    await db.run(`DELETE FROM cart WHERE cartItemId = ?`, [cartItemId]);
    await db.close();
    res.json({message: 'Cart item removed successfully'});
  } catch (err) {
    res.status(SERVER_ERROR).json({error: err.message});
  }
});

// Places an order.
app.post('/api/order', async (req, res) => {
  let userId = req.session.userId; // Get the userId from the session

  if (!userId) {
    return res.status(LOGIN_ERROR).json({error: 'User not logged in'});
  }

  let {pickupTime} = req.body;

  // Check if the time is within the allowed range
  let [hours, minutes] = pickupTime.split(':').map(Number);
  if (hours < OPENING_TIME || hours > CLOSING_TIME || (hours === CLOSING_TIME && minutes > 0)) {
    return res.status(BAD_REQUEST).json({error: 'Pickup time must be between 8:00 AM-4:00 PM.'});
  }

  // Generate a confirmation code
  let confirmationCode = crypto.randomBytes(BYTES).toString('hex');

  let db = await getDBConnection();
  let now = new Date().toISOString();
  let orderId;
  try {
    let result = await db.run(`INSERT INTO orders (userId, orderDate, status, totalPrice,
                  confirmationCode)
                  VALUES (?, ?, ?, ?, ?)`, [userId, now, 'Pending', 0, confirmationCode]);

    orderId = result.lastID;

    await processOrderItems(db, userId, orderId);

    res.status(OK_CODE).json({message: 'Order placed successfully!', confirmationCode});
  } catch (err) {
    console.error('Error placing order:', err.message);
    await cleanupFailedOrder(db, orderId);
    res.status(SERVER_ERROR).json({error: 'Failed to place order'});
  }
  await db.close();
});

// Searches through products based on a search term.
app.get('/api/search', async (req, res) => {
  let searchTerm = `%${req.query.term}%`;

  try {
    let db = await getDBConnection();
    let rows = await db.all(`
      SELECT MIN(id) as id, name, price, availability, category
      FROM products
      WHERE name LIKE ? OR price LIKE ? OR category LIKE ? OR availability LIKE ?
      GROUP BY name, price, availability`, [searchTerm, searchTerm, searchTerm, searchTerm]);
    await db.close();
    res.json(rows);
  } catch (err) {
    console.error('Error searching products:', err.message);
    res.status(SERVER_ERROR).json({error: err.message});
  }
});

// Verifies the login status of the user.
app.get('/api/login-status', async (req, res) => {
  if (req.session.userId) {
    let db = await getDBConnection();

    try {
      let row = await db.get(`SELECT username FROM users WHERE userId = ?`, [req.session.userId]);
      res.json({loggedIn: true, username: row.username});
    } catch (err) {
      console.error('Error retrieving user info:', err.message);
      res.status(SERVER_ERROR).json({error: err.message});
    }
    await db.close();
  } else {
    res.json({loggedIn: false});
  }
});

// Retrieves the order history for the logged-in user.
app.get('/api/order-history', async (req, res) => {
  let userId = req.session.userId; // Get the userId from the session

  if (!userId) {
    return res.status(LOGIN_ERROR).json({error: 'User not logged in'});
  }

  let db = await getDBConnection();

  try {
    let rows = await db.all(`
      SELECT orders.orderId, orders.orderDate, orders.status, orders.confirmationCode,
             SUM(orderItems.quantity * orderItems.price) AS totalPrice,
             GROUP_CONCAT(products.name || ' x ' || orderItems.quantity, ', ') as items
      FROM orders
      JOIN orderItems ON orders.orderId = orderItems.orderId
      JOIN products ON orderItems.productId = products.id
      WHERE orders.userId = ?
      GROUP BY orders.orderId
      ORDER BY orders.orderDate DESC`, [userId]);
    res.json(rows);
  } catch (err) {
    console.error('Error retrieving order history:', err.message);
    res.status(SERVER_ERROR).json({error: err.message});
  }
  await db.close();
});

// Logs out the user.
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(SERVER_ERROR).json({error: 'Failed to log out'});
    }
    res.clearCookie('connect.sid');
    res.json({message: 'Logged out successfully'});
  });
});

// Handles adding the information from the contact form into the database.
app.post('/api/contact', async (req, res) => {
  let {firstName, lastName, email, message} = req.body;

  if (!firstName || !lastName || !email || !message) {
    return res.status(BAD_REQUEST).json({error: 'All fields are required'});
  }

  let emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailCheck.test(email)) {
    return res.status(BAD_REQUEST).json({error: 'Invalid email address'});
  }

  let submissionDate = new Date().toISOString();
  let db = await getDBConnection();

  try {
    await db.run(`INSERT INTO contactMessages (firstName, lastName, email, message, submissionDate)
                  VALUES (?, ?, ?, ?, ?)`, [firstName, lastName, email, message, submissionDate]);
    res.status(GOOD_CREATE).json({message: 'Contact message saved successfully'});
  } catch (err) {
    console.error('Error saving contact message:', err.message);
    res.status(SERVER_ERROR).json({error: 'Failed to save contact message'});
  }
  await db.close();
});

/**
 * Processes the user's cart, adding all items to an order and calculating the total price.
 * @param {object} db - The database object.
 * @param {number} userId - The ID of the user whose cart is being processed.
 * @param {number} orderId - The ID of the order being created.
 * @returns {Promise<void>} A promise that will resolve when the procesing is complete.
 */
async function processOrderItems(db, userId, orderId) {
  let cartItems = await db.all(`SELECT cart.productId, cart.quantity, products.price
                                  FROM cart
                                  JOIN products ON cart.productId = products.id
                                  WHERE cart.userId = ?`, [userId]);

  let totalPrice = 0;
  for (let item of cartItems) {
    totalPrice += item.quantity * item.price;
    await db.run(`INSERT INTO orderItems (orderId, productId, quantity, price)
                  VALUES (?, ?, ?, ?)`, [orderId, item.productId, item.quantity, item.price]);
  }
  await db.run(`UPDATE orders SET totalPrice = ? WHERE orderId = ?`, [totalPrice, orderId]);
  await db.run(`DELETE FROM cart WHERE userId = ?`, [userId]);
}

/**
 * Cleans up a failed order by removing all order items and deleting the order.
 *
 * @param {object} db - The database connection object.
 * @param {number} orderId - The ID of the order to be cleaned up.
 * @returns {Promise<void>} A promise that resolves when the cleanup is complete.
 */
async function cleanupFailedOrder(db, orderId) {
  await db.run(`DELETE FROM orderItems WHERE orderId = ?`, [orderId]);
  await db.run(`DELETE FROM orders WHERE orderId = ?`, [orderId]);
}

// Start the server at the bottom of the file.
app.use(express.static('public'));
const PORT = process.env.PORT || DFLT_PORT;
app.listen(PORT);
