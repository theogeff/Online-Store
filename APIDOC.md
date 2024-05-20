# *Theo Gefflaut * API Documentation
*Fill in a short description here about the API's purpose.*

## *Get menu*
**Request Format:** */team*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *Retrieves in stock items at the bakery.*

**Example Request:** *GET /menu*

**Example Response:**
```
[
  {
    "id": 1,
    "name": "Croissant",
    "price": 5.95,
    "description": "Classic french buttery and flaky pastry."
  },
  {
    "id": 2,
    "name": "Baguette",
    "price": 3.99,
    "description": "A classic French bread, baked in our Redmond location."
  }
]

```

**Error Handling:**
*In case of an issue with either the server or the data, a 500 Internal server error is returned.*


## *Place Order*
**Request Format:** */order*

**Request Type:** *POST*
**Parameters:** customerName (string), customerEmail(string), orderItems(array), pickup(boolean)
**Returned Data Format**: JSON

**Description:** *Returns a JSON object containing order details.

**Example Request:** *{
  "customerName": "John Doe",
  "customerEmail": "johndoe@example.com",
  "orderItems": [
    { "itemId": 1, "quantity": 2 },
    { "itemId": 2, "quantity": 1 }
  ],
  "pickup": true
}*

**Example Response:**

```
{
  "orderId": 12345,
  "status": "Pending",
  "estimatedTime": "2024-05-19T15:30:00Z"
}
```

**Error Handling:**
*In case of an issue with with the serever a 500 status code error is thrown. In case of a bad
request like missing parameters 400 level error is thrown.*


## *Order Status*
**Request Format:** */order/status?orderId=*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *Returns a JSON object with the order status.*

**Example Request:** *POST /order/status?orderId=12345*

**Example Response:**

```
{
  "orderId": 12345,
  "status": "In Progress",
  "estimatedTime": "2024-05-19T15:30:00Z"
}
```

**Error Handling:**
*In case where the order isn't found a 404 error is thrown. If it is an server error then a 500
error is thrown.*

## *Contact*
**Request Format:** */contact*

**Request Type:** *POST

**Returned Data Format**: JSON

**Description:** *Returns a JSON object with the order status.*

**Example Request:** *
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "johndoe@example.com",
  "message": "Example Message"
}*

**Example Response:**

```
{
  "status": "Success",
  "message": "Thank you for your feedback, John!"
}
```

**Error Handling:**
*In case of an issue with with the serever a 500 status code error is thrown. In case of a bad
request like missing parameters 400 level error is thrown.*

## *Cancel Order*
**Request Format:** */order/cancel*

**Request Type:** *POST

**Returned Data Format**: JSON

**Description:** *Returns a JSON object with the order status.*

**Example Request:** *
{
  "orderId": 12345,
  "customerEmail": "johndoe@example.com"
}*

**Example Response:**

```
{
  "orderId": 12345,
  "status": "Cancelled"
}
```

**Error Handling:**
*In case where the order isn't found a 404 error is thrown. If it is an server error then a 500
error is thrown.In case of a bad request like the order not being cancellable 400 level error is thrown.*

