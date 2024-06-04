# *Theo Gefflaut * API Documentation
*This API allows all functionality for the store. Endpoints for logging in, making orders adding
items to the cart, writing a contact form are defined by it.*

## *User Registration*
**Request Format:** */api/register*

**Request Type:** *POST*

**Returned Data Format**: JSON

**Description:** *Registers a new user in the database.*

**Example Request:** *POST /api/register*
{
  "username": "string",
  "email": "string",
  "password": "string"
}

**Example Response:**
```
  {
  "message": "User registered successfully",
  "userId": "number"
}

```

**Error Handling:**
*In case of an issue with either the server or the data, a 500 Internal server error is returned.*


## *User Login*
**Request Format:** */api/login*

**Request Type:** *POST*

**Returned Data Format**: JSON

**Description:** *Logs in an existing user.*

**Example Request:** *
{
  "username": "string",
  "password": "string"
}*

**Example Response:**

```
{
  "message": "Login successful"
}
```

**Error Handling:**
*In case of an issue with with the serever a 500 status code error is thrown. In case of a bad
request like the user not existing in the database a 401 level error is thrown.*


## *Products by category*
**Request Format:** */api/products/:category*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *Retrieves all products associated with a category.*

**Example Request:** *GET /api/products/Viennoiseries*

**Example Response:**

```
[
  {
    "id": "number",
    "name": "string",
    "price": "number",
    "category": "string",
    "imgUrl": "string"
  }
]
```

**Error Handling:**
*If it is an server error then a 500
error is thrown.*

## *Retrieve by ID*
**Request Format:** */api/product/:id*

**Request Type:** *GET

**Returned Data Format**: JSON

**Description:** *Retrieves details of a products by its ID.*

**Example Request:** */api/product/1*

**Example Response:**

```
{
  "id": "number",
  "name": "string",
  "price": "number",
  "category": "string",
  "imgUrl": "string",
  "availability": "string"
}
```

**Error Handling:**
*In case of an issue with with the serever a 500 status code error is thrown.*

## *Add item to cart*
**Request Format:** */api/cart*

**Request Type:** *POST

**Returned Data Format**: JSON

**Description:** *Adds an item to the cart for the logged in user.*

**Example Request:** *
{
  "productId": "number",
  "quantity": "number"
}*

**Example Response:**

```
{
  "message": "Item added to cart",
  "productId": "number"
}
```

**Error Handling:**
*In case where the user isn't signed in a 401 error is thrown. In case of a server error a 500 level
error is thrown.*

## *Retrieve Cart items*
**Request Format:** */api/cart*

**Request Type:** *GET

**Returned Data Format**: JSON

**Description:** *Adds an item to the cart for the logged in user.*

**Example Request:** *GET /api/cart*

**Example Response:**

```
[
  {
    "cartItemId": "number",
    "name": "string",
    "price": "number",
    "quantity": "number"
  }
]
```

**Error Handling:**
*In case where the user isn't signed in a 401 error is thrown. In case of a server error a 500 level
error is thrown.*

## *Clear the cart*
**Request Format:** */api/cart*

**Request Type:** *DELETE*

**Returned Data Format**: JSON

**Description:** *Clears the cart for the logged in user.*

**Example Request:** *DELETE /api/cart*

**Example Response:**

```
{
  "message": "Your cart is empty"
}
```

**Error Handling:**
*In case where the user isn't signed in a 401 error is thrown. In case of a server error a 500 level
error is thrown.*

## *Update Item quanitity*
**Request Format:** */api/cart/:id*

**Request Type:** *PUT*

**Returned Data Format**: JSON

**Description:** *Updates the quantity of an item in the cart.*

**Example Request:** *
{
  "quantity": "number"
}*

**Example Response:**

```
{
  "message": "Your cart is empty"
}
```

**Error Handling:**
*In case of a server error a 500 level
error is thrown.*

## *Remove Cart Item*
**Request Format:** */api/cart/:id*

**Request Type:** *DELETE*

**Returned Data Format**: JSON

**Description:** *Removes an item from the cart.*

**Example Request:** *DELETE /api/cart/1*

**Example Response:**

```
{
  "message": "Cart item removed successfully"
}
```

**Error Handling:**
*In case of a server error a 500 level
error is thrown.*

## *Placing an order*
**Request Format:** */api/order*

**Request Type:** *POST*

**Returned Data Format**: JSON

**Description:** *Places an order for the logged in user.*

**Example Request:** *
{
  "pickupTime": "string"
}
*

**Example Response:**

```
{
  "message": "Order placed successfully!",
  "confirmationCode": "string"
}
```

**Error Handling:**
*In case of a server error a 500 level
error is thrown. If the pick-up time is invalid, a 400 error is thrown.*

## *Retrieving the order history*
**Request Format:** */api/order-history*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *Retrieves the order history for a logged-in user.*

**Example Request:** *GET /api/order-history*

**Example Response:**

```
[
  {
    "orderId": "number",
    "orderDate": "string",
    "status": "string",
    "confirmationCode": "string",
    "totalPrice": "number",
    "items": "string"
  }
]
```

**Error Handling:**
*In case of a server error a 500 level
error is thrown. If the user isn't logged in, a 401 error is thrown.*

## *Check Log-in Status*
**Request Format:** */api/login-status*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *Verifies the login status of the user.*

**Example Request:** *GET /api/login-status*

**Example Response:**

```
{
  "loggedIn": true,
  "username": "string"
}
```

**Error Handling:**
*In case of a server error a 500 level
error is thrown.*

## *Logout a user*
**Request Format:** */api/logout*

**Request Type:** *POST*

**Returned Data Format**: JSON

**Description:** *Logs out the user.*

**Example Request:** *GET /api/logout*

**Example Response:**

```
{
  "message": "Logged out successfully"
}
```

**Error Handling:**
*In case of a server error a 500 level
error is thrown.*

## *Contact Form Submission*
**Request Format:** */api/contact*

**Request Type:** *POST*

**Returned Data Format**: JSON

**Description:** *Handles adding the contact form information to the database.*

**Example Request:** *{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "message": "string"
}*

**Example Response:**

```
{
  "message": "Contact message saved successfully"
}
```

**Error Handling:**
*In case of a server error a 500 level
error is thrown. A 400 level error is thrown if the email is invalid or a field ins't filled out.*




