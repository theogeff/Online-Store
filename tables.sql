-- Drop existing tables if they exist
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS orderItems;
DROP TABLE IF EXISTS cart;

-- Create users table
CREATE TABLE users (
  userId INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  hashedPassword TEXT NOT NULL
);

-- Create products table
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT,
  name TEXT,
  price TEXT,
  imgUrl TEXT,
  availability TEXT
);

-- Create orders table
CREATE TABLE orders (
  orderId INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  orderDate TEXT NOT NULL,
  status TEXT NOT NULL,
  totalPrice REAL NOT NULL,
  confirmationCode TEXT,
  FOREIGN KEY (userId) REFERENCES users(userId)
);

-- Create orderItems table
CREATE TABLE orderItems (
  orderItemId INTEGER PRIMARY KEY AUTOINCREMENT,
  orderId INTEGER NOT NULL,
  productId INTEGER NOT NULL,
  quantity INTEGER CHECK(quantity <= 100),
  price REAL NOT NULL,
  FOREIGN KEY (orderId) REFERENCES orders(orderId),
  FOREIGN KEY (productId) REFERENCES products(id)
);

-- Create cartItems table
CREATE TABLE cart (
  cartItemId INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  productId INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(userId),
  FOREIGN KEY (productId) REFERENCES products(id)
);

-- Create the contactMessages table
CREATE TABLE IF NOT EXISTS contactMessages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  submissionDate TEXT NOT NULL
);

-- Empty products table.
DELETE FROM products;

-- Insert products.
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Breakfast', '#C - Le Croissant from L''Experience', '5.95', 'imgs/products/croissant.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Breakfast', 'Pain aux Chocolats', '6.50', 'imgs/products/painauchocolat.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Breakfast', 'Croissant aux Amandes', '7.95', 'imgs/products/croissantauxamandes.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Breakfast', 'Pain aux chocolats, amandes et banana', '7.95', 'imgs/products/painauxchocolatsamandesetbanane.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Breakfast', 'Kouign-Amann', '7.95', 'imgs/products/kouign-amann.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Breakfast', 'Ham and Cheese Croissant', '8.95', 'imgs/products/hamandcheesecroissant.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Breakfast', '3 Cheese & Fig Kouignn Amann', '8.95', 'imgs/products/3cheeseandfig.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Breakfast', 'Decouverte de la Viennoiserie', '45', 'imgs/products/decouverte.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Breakfast', 'Les Quiches', '17', 'imgs/products/quiche.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Breakfast', 'Les Croques', '17', 'imgs/products/croque.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Lunch', 'Le Californien - Baguette Sandwich', '15', 'imgs/products/cali.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Lunch', 'Le Bayonne - Baguette Sandwich', '15', 'imgs/products/bayonne.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Lunch', 'Le Lyonnais - Baguette Sandwich', '15', 'imgs/products/lyon.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Lunch', 'Le Parisien - Baguette Sandwich', '15', 'imgs/products/paris.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Lunch', 'L''Italien - Baguette Sandwich', '15', 'imgs/products/ital.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Lunch', 'Les Quiches', '17', 'imgs/products/quiche.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Lunch', 'Les Croques', '17', 'imgs/products/croque.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Lunch', 'Ham and Cheese Croissant', '8.95', 'imgs/products/hamandcheesecroissant.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Lunch', '3 Cheese & Fig Kouignn Amann', '8.95', 'imgs/products/3cheeseandfig.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Brunch', 'Eggs Benedict Croissant', '12', 'imgs/products/default.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Brunch', 'Eggs Benedict English Muffin', '21', 'imgs/products/benedict.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Brunch', 'L''Experience Mimosa', '16', 'imgs/products/mimosa.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Brunch', 'Les Tartines - Avocado Toast', '15', 'imgs/products/default.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Brunch', 'Les Tartines - Beef Tartine du Chef', '20', 'imgs/products/default.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Brunch', 'Les Tartines - Ricotta Toast', '17', 'imgs/products/default.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Brunch', 'Les Omelettes', '14', 'imgs/products/default.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Brunch', 'Les Salades - Salade Nicoise', '14', 'imgs/products/default.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Brunch', 'Les Salades - Salade Poulet', '16', 'imgs/products/default.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Brunch', 'Les Salades - Side Salad', '5', 'imgs/products/default.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Brunch', 'Les Quiches', '17', 'imgs/products/quiche.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Brunch', 'Les Croques', '17', 'imgs/products/croque.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Brunch', 'Les Pains Perdus - French Toast', '18', 'imgs/products/painsperdus.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Viennoiseries', '#C - Le Croissant from L''Experience', '5.95', 'imgs/products/croissant.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Viennoiseries', 'Pain aux Chocolats', '6.50', 'imgs/products/painauchocolat.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Viennoiseries', 'Croissant aux Amandes', '7.95', 'imgs/products/croissantauxamandes.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Viennoiseries', 'Pain aux chocolats, amandes et banana', '7.95', 'imgs/products/painauxchocolatsamandesetbanane.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Viennoiseries', 'Kouign-Amann', '7.95', 'imgs/products/kouign-amann.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Viennoiseries', 'Ham and Cheese Croissant', '8.95', 'imgs/products/hamandcheesecroissant.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Viennoiseries', '3 Cheese & Fig Kouignn Amann', '8.95', 'imgs/products/3cheeseandfig.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Viennoiseries', 'Decouverte de la Viennoiserie', '45', 'imgs/products/decouverte.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Coffee', 'Espresso', '3.95', 'imgs/products/coffee.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Coffee', 'Macchiato', '4.25', 'imgs/products/coffee.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Coffee', 'Americano', '4.25', 'imgs/products/coffee.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Coffee', 'Cafe Latte', '4.75', 'imgs/products/coffee.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Coffee', 'Cappucino', '4.75', 'imgs/products/coffee.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Coffee', 'Cafe Mocha', '5.50', 'imgs/products/coffee.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Coffee', 'Cafe au Lait', '4.75', 'imgs/products/coffee.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Coffee', 'Chai Latte', '5.00', 'imgs/products/coffee.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Coffee', 'Cold or Hot Milk', '2.95', 'imgs/products/coffee.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Coffee', 'Signature Hot Chocolate', '6.50', 'imgs/products/coffee.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Patisserie', 'Petit Yuzu', '14', 'imgs/products/yuzu.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Patisserie', 'Choco-nut', '15', 'imgs/products/choconut.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Patisserie', 'Blueberry Vanilla Tart', '14', 'imgs/products/blueberrytart.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Patisserie', 'Pavlova Berries', '15', 'imgs/products/pavlova.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Patisserie', 'Charlotte', '16', 'imgs/products/charlotte.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Made-to-order Desserts', 'Le Millefeuille', '80', 'imgs/products/millefeuille.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Made-to-order Desserts', 'Le Fraisier', '78', 'imgs/products/fraisier.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Made-to-order Desserts', 'Grand Choco-Nut', '80', 'imgs/products/grandchoconut.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Made-to-order Desserts', 'Passion', '72', 'imgs/products/passion.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Made-to-order Desserts', 'Grand Yuzu', '72', 'imgs/products/grandyuzu.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Made-to-order Desserts', 'Paris-Washington', '62', 'imgs/products/pariswashington.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Bread', 'Traditional Organic Sourdough Bread (Thursday to Sunday)', '15', 'imgs/products/sourdough.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Bread', 'Pain du Pecheur', '12', 'imgs/products/pecheur.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Bread', 'La Mega Pepite', '21', 'imgs/products/megapepite.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Mini-Croissants (by the dozen)', '48', 'imgs/products/minicroissant.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Mini-Pain aux Chocolats (by the dozen)', '48', 'imgs/products/minipainauxchocolats.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Mini-Ham & Cheese Croissants (by the dozen)', '48', 'imgs/products/miniham.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'La Quiche Familiale', '59', 'imgs/products/familiale.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Mini-Gluten Free Quiche (by the dozen)', '72', 'imgs/products/miniquiche.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Yogurt and Fruit Parfaits (by the dozen)', '108', 'imgs/products/yogurtparfait.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Fresh fruits Salad Verrine (by the dozen)', '120', 'imgs/products/fruitsalad.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Mini-Hazelnut, Tonka, Banana Tart (by the dozen)', '72', 'imgs/products/minihazelnut.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Mini-Raspberry Eclair (by the dozen)', '72', 'imgs/products/minieclair.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Mini-Chocolate Mousse (by the dozen)', '60', 'imgs/products/minimousse.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Mini-Choco-nut (by the dozen)', '72', 'imgs/products/minichoconut.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Mini-Blueberry Tart (by the dozen)', '72', 'imgs/products/miniblueberry.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Mini-Yuzu Tart (by the dozen)', '72', 'imgs/products/miniyuzu.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Drip Coffee Container', '30', 'imgs/products/dripcoffee.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Gougeres (by the dozen)', '36', 'imgs/products/gougerescatering.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Mini-Gluten Free Quiche (by the dozen)', '72', 'imgs/products/miniquiche.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Mini-Salmon Tartine (by the dozen)', '66', 'imgs/products/minisalmon.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Tuna Verrine (by the dozen)', '120', 'imgs/products/tunaverrine.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Risotto Leek, Parmesan Verrine (by the dozen)', '144', 'imgs/products/parmesanverrine.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Mini-Signature Burger (by the dozen)', '168', 'imgs/products/miniburger.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Fresh fruits Salad Verrine (by the dozen)', '120', 'imgs/products/fruitsalad.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Mini-Hazelnut, Tonka, Banana Tart (by the dozen)', '72', 'imgs/products/minihazelnut.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Mini-Raspberry Eclair (by the dozen)', '72', 'imgs/products/minieclair.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Mini-Chocolate Mousse (by the dozen)', '60', 'imgs/products/minimousse.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Mini-Choco-nut (by the dozen)', '72', 'imgs/products/minichoconut.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Mini-Blueberry Tart (by the dozen)', '72', 'imgs/products/miniblueberry.webp', 'available');
INSERT INTO products (category, name, price, imgUrl, availability) VALUES ('Catering and Events', 'Mini-Yuzu Tart (by the dozen)', '72', 'imgs/products/miniyuzu.webp', 'available');
