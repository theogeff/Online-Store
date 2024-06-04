"use strict";

(function () {
  window.addEventListener("load", init);

  /**
   * Initializes the page by setting up event listeners and checking on the login status.
   */
  function init() {
    checkLoginStatus();
    let contactBtn = id('contact-btn');
    contactBtn.addEventListener("click", createPopUp);

    function checkLoginStatus() {
      fetch('/api/login-status')
        .then(response => response.json())
        .then(data => {
          if (data.loggedIn) {
            document.getElementById('account-welcome').textContent = `Welcome, ${data.username}!`;
            document.getElementById('order-history-link').addEventListener('click', (event) => {
              event.preventDefault();
              fetchOrderHistory();
            });
            document.getElementById('sign-out-btn').addEventListener('click', handleSignOut);
            openPopup('account-popup-logged-in');
          }
        })
        .catch(error => console.error('Error checking login status:', error));
    }

    let logo = document.getElementById('logo');
    if (logo) {
      logo.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }

    let searchIcon = id('search-icon');
    if (searchIcon) {
      searchIcon.addEventListener('click', () => {
        openPopup('search-popup');
      });
    }

    let makeOrderBtn = id('make-order-btn');
    makeOrderBtn.addEventListener('click', openOrderPopup);
    updateMakeOrderButton();

    let accountIcon = id('account-icon');
    if (accountIcon) {
      accountIcon.addEventListener('click', handleAccountIconClick);
    }

    let cartIcon = id('cart-icon');
    if (cartIcon) {
      cartIcon.addEventListener('click', () => {
        openPopup('cart-popup');
        updateCartDisplay();
      });
    }

    let clearCartBtn = id('clear-cart-btn');
    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', clearCart);
    }

    let searchForm = document.getElementById('search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', handleSearch);
    }

    let gridViewBtn = id('grid-view-btn');
    let listViewBtn = id('list-view-btn');
    gridViewBtn.addEventListener('click', () => toggleView('grid'));
    listViewBtn.addEventListener('click', () => toggleView('list'));

    // Initialize popups
    let popups = document.querySelectorAll('.popup');
    popups.forEach(popup => {
      let closeBtn = popup.querySelector('.close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          popup.style.display = 'none';
        });
      }

      window.addEventListener('click', (event) => {
        if (event.target === popup) {
          popup.style.display = 'none';
        }
      });
    });

    let shopNavList = document.getElementById('shop-nav-list');
    if (shopNavList) {
      // Initially loads all products under the viennoiserie section when the store is entered.
      fetchAndRenderProducts('/api/products/Viennoiseries', 'Viennoiseries');

      shopNavList.addEventListener('click', (event) => {
        event.preventDefault();
        let category = event.target.getAttribute('data-category');
        fetchAndRenderProducts(`/api/products/${category}`, category);
      });
    }
  }

  /**
   * Fetches and render in products from the given url.
   * @param {string} url - The URL to fetch products from.
   * @param {string} title - The name of the product category.
   */
  function fetchAndRenderProducts(url, title) {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        renderProducts(data, title);
      })
      .catch(error => console.error('Error fetching products:', error));
  }

  /**
   * Displays products on the page.
   * @param {string} data - The set of product object to display.
   * @param {string} title - The name of the product category.
   */
  function renderProducts(data, title) {
    let shopContent = document.getElementById('shop-content');
    shopContent.innerHTML = ''; // Clear existing content

    let categorySection = document.createElement('section');
    categorySection.classList.add('shop-category');
    let categoryTitle = document.createElement('h2');
    categoryTitle.textContent = title.charAt(0).toUpperCase() + title.slice(1);
    categorySection.appendChild(categoryTitle);

    let itemList = document.createElement('ul');
    let uniqueProductIds = new Set(); // Track unique product IDs

    data.forEach(item => {
      if (!uniqueProductIds.has(item.id)) {
        uniqueProductIds.add(item.id);
        console.log('Rendering product:', item); // Add log to check product details
        let itemImage = document.createElement('img');
        itemImage.src = item.imgUrl;
        itemImage.alt = item.name;
        itemImage.classList.add('product-image');
        let itemDescription = document.createElement('p');
        itemDescription.textContent = `${item.name} - $${item.price}`;
        let itemElement = document.createElement('li');
        itemElement.dataset.productId = item.id; // Ensure product ID is set
        itemElement.appendChild(itemImage);
        itemElement.appendChild(itemDescription);
        itemElement.addEventListener('click', () => openQuantityPopup(item.id)); // Ensure correct ID is passed
        itemList.appendChild(itemElement);
      }
    });
    categorySection.appendChild(itemList);

    shopContent.appendChild(categorySection);
  }


  /**
   * Opens the popup allowing users to chose a quantity and add to cart.
   * @param {number} productId - The ID of the clicked product.
   */
  function openQuantityPopup(productId) {

    let popup = document.getElementById('quantity-popup');
    let quantityForm = document.getElementById('quantity-form');
    console.log('Opening quantity popup for product ID:', productId);

    quantityForm.dataset.productId = productId; // Store product ID in form

    // Remove previous event listeners to avoid duplicates
    let newForm = quantityForm.cloneNode(true);
    quantityForm.parentNode.replaceChild(newForm, quantityForm);

    newForm.dataset.productId = productId; // Restore product ID

    // Fetch product details
    fetch(`/api/product/${productId}`)
      .then(response => response.json())
      .then(data => {
        console.log('Fetched product details:', data);
        // Update the popup content with product details
        document.getElementById('popup-product-name').textContent = data.name;
        document.getElementById('popup-product-img').src = data.imgUrl;
        document.getElementById('popup-product-price').textContent = `Price: $${data.price}`;
        document.getElementById('popup-product-availability').textContent = `Availability: ${data.availability}`;
        document.getElementById('quantity').value = 1; // Reset quantity to 1
      })
      .catch(error => console.error('Error fetching product details:', error));

    popup.style.display = 'block';

    newForm.addEventListener('submit', function handler(event) {
      event.preventDefault();
      let quantity = document.getElementById('quantity').value;
      addToCart(productId, quantity);
      popup.style.display = 'none';
      newForm.removeEventListener('submit', handler);
    });
  }


  /**
   * Closes the quantity popup.
   */
  function closeQuantityPopup() {
    let popup = document.getElementById('quantity-popup');
    popup.style.display = 'none';
  }

  document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', closeQuantityPopup);
  });

  /**
   * Adds a product to the cart.
   * @param {number} productId - The ID of the product to be added to the cart.
   * @param {number} quantity - The amount or quantity of the product being added.
   */
  function addToCart(productId, quantity) {
    fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: productId,
        quantity: quantity
      })
    })
      .then(response => {
        if (response.status === 401) {
          alert('You need to be logged in to add items to the cart.');
          throw new Error('User not logged in');
        }
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Added to cart:', data);
        updateCartDisplay();
      })
      .catch(error => console.error('Error adding to cart:', error));
  }
  /**
   * Handles the search functionality.
   * @param {Event} event - The event object.
   */
  function handleSearch(event) {
    event.preventDefault();
    let searchTerm = document.getElementById('search-input').value;
    fetchAndRenderProducts(`/api/search?term=${encodeURIComponent(searchTerm)}`, 'Search Results');
    closePopup('search-popup');
  }

  /**
   * Handles the popup that displayed when clicking on the account icon, this will depend on the log
   * in status of the user.
   */
  function handleAccountIconClick() {
    fetch('/api/login-status')
      .then(response => response.json())
      .then(data => {
        if (data.loggedIn) {
          document.getElementById('account-welcome').textContent = `Welcome, ${data.username}!`;
          openPopup('account-popup-logged-in');
          document.getElementById('order-history-link').addEventListener('click', (event) => {
            event.preventDefault();
            fetchOrderHistory();
          });
          document.getElementById('sign-out-btn').addEventListener('click', handleSignOut);
        } else {
          openPopup('account-popup');
        }
      })
      .catch(error => console.error('Error checking login status:', error));
  }

  /**
   * Handles the sign out event.
   */
  function handleSignOut() {
    fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to log out');
        }
        return response.json();
      })
      .then(data => {
        alert('You have been signed out.');
        closePopup('account-popup-logged-in');
        // Optionally reload the page or update UI to reflect signed-out state
        window.location.reload();
      })
      .catch(error => console.error('Error logging out:', error));
  }

  /**
   * Fetches and displays the order history for a specific user.
   */
  function fetchOrderHistory() {
    fetch('/api/order-history')
      .then(response => response.json())
      .then(data => {
        let orderHistoryList = document.getElementById('order-history-list');
        orderHistoryList.innerHTML = '';

        if (data.length === 0) {
          let emptyMessage = document.createElement('p');
          emptyMessage.textContent = 'No order history available.';
          orderHistoryList.appendChild(emptyMessage);
        } else {
          data.forEach(order => {
            let orderElement = document.createElement('div');
            orderElement.classList.add('order');

            let orderDetails = document.createElement('p');
            orderDetails.textContent = `Order Date: ${order.orderDate}, Status: ${order.status}, Total: $${order.totalPrice.toFixed(2)}, Confirmation Code: ${order.confirmationCode}`;
            orderElement.appendChild(orderDetails);

            let orderItems = document.createElement('ul');
            order.items.split(', ').forEach(item => {
              let itemElement = document.createElement('li');
              itemElement.textContent = item;
              orderItems.appendChild(itemElement);
            });
            orderElement.appendChild(orderItems);

            orderHistoryList.appendChild(orderElement);
          });
        }
        closePopup('account-popup-logged-in');
        openPopup('order-history-popup');
      })
      .catch(error => console.error('Error fetching order history:', error));
  }

  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('register-form').addEventListener('submit', handleRegister);
  document.getElementById('create-account-link').addEventListener('click', (event) => {
    event.preventDefault();
    closePopup('account-popup');
    openPopup('register-popup');
  });

  /**
   * Handles the login functionality.
   * @param {Event} event - The event object.
   */
  function handleLogin(event) {
    event.preventDefault();
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.error);
          });
        }
        return response.json();
      })
      .then(data => {
        if (data.message) {
          alert(data.message);
          closePopup('account-popup');
        }
      })
      .catch(error => {
        if (error.message.includes('Username not found')) {
          alert('Username not found. Try creating an account.');
        } else if (error.message.includes('Incorrect password')) {
          alert('Incorrect password!');
        } else {
          console.error('Error logging in:', error);
          alert('An unexpected error occurred. Please try again.');
        }
      });
  }

  /**
   * Handles the create account or registration functionality.
   * @param {Event} event - The event object.
   */
  function handleRegister(event) {
    event.preventDefault();
    let username = document.getElementById('new-username').value;
    let email = document.getElementById('new-email').value;
    let password = document.getElementById('new-password').value;

    fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    })
      .then(response => response.json())
      .then(data => {
        if (data.userId) {
          alert('Registration successful');
          closePopup('register-popup');
        } else {
          alert('Registration failed...');
        }
      })
      .catch(error => console.error('Error registering:', error));
  }

  /**
   * Updates the cart and ensures all current cart items are displayed correctly.
   */
  function updateCartDisplay() {
    fetch('/api/cart')
      .then(response => response.json())
      .then(cartItems => {
        let cartItemsList = document.getElementById("cart-items");
        cartItemsList.innerHTML = ""; // Clear existing cart items

        if (!Array.isArray(cartItems) || cartItems.length === 0) {
          let emptyMessage = document.createElement("li");
          emptyMessage.textContent = "Your cart is empty.";
          cartItemsList.appendChild(emptyMessage);
        } else {
          cartItems.forEach(item => {
            let itemElement = document.createElement("li");

            let minusButton = document.createElement("button");
            minusButton.textContent = "-";
            minusButton.classList.add("quantity-btn");
            minusButton.addEventListener('click', () => updateCartItemQuantity(item.cartItemId, item.quantity - 1));

            let plusButton = document.createElement("button");
            plusButton.textContent = "+";
            plusButton.classList.add("quantity-btn");
            plusButton.addEventListener('click', () => updateCartItemQuantity(item.cartItemId, item.quantity + 1));

            let quantitySpan = document.createElement("span");
            quantitySpan.textContent = `${item.quantity}`;

            itemElement.appendChild(minusButton);
            itemElement.appendChild(quantitySpan);
            itemElement.appendChild(plusButton);
            itemElement.appendChild(document.createTextNode(` ${item.name} - $${item.price}`));
            cartItemsList.appendChild(itemElement);
          });
        }
        updateMakeOrderButton();
      })
      .catch(error => console.error("Error fetching cart items", error));
  }

  /**
   * Clears the cart by removing all the items from it.
   */
  function clearCart() {
    fetch('/api/cart', {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => {
        let cartItemsList = document.getElementById("cart-items");
        cartItemsList.innerHTML = ""; // Clear existing cart items
        let emptyMessage = document.createElement("li");
        emptyMessage.textContent = data.message;
        cartItemsList.appendChild(emptyMessage);
        updateMakeOrderButton();
      })
      .catch(error => console.error("Error clearing cart", error));
  }
  /**
   * Handles dynamically changing the quantity of a product already in the cart.
   * @param {number} cartItemId - The ID of the item which quantity is to be changed.
   * @param {number} newQuantity - The new quantity of the item in the cart.
   */
  function updateCartItemQuantity(cartItemId, newQuantity) {
    if (newQuantity >= 1) {
    fetch(`/api/cart/${cartItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quantity: newQuantity
      })
    })
      .then(response => response.json())
      .then(data => {
        updateCartDisplay();
      })
      .catch(error => console.error('Error updating cart item quantity:', error));
    } else {
      removeCartItem(cartItemId);  // Updated to remove item if quantity is less than 1
    }
  }

  /**
   * Removes an individual cart item.
   * @param {number} cartItemId - The ID of the cart item.
   */
  function removeCartItem(cartItemId) {
    fetch(`/api/cart/${cartItemId}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => {
        updateCartDisplay();
      })
      .catch(error => console.error('Error removing cart item:', error));
  }

  /**
   * Ensures that the make order button only works when items are in the cart of a signed in user.
   */
  function updateMakeOrderButton() {
    fetch('/api/cart')
      .then(response => response.json())
      .then(cartItems => {
        let makeOrderBtn = id('make-order-btn');
        if (Array.isArray(cartItems) && cartItems.length > 0) {
          makeOrderBtn.disabled = false;
        } else {
          makeOrderBtn.disabled = true;
        }
      })
      .catch(error => console.error("Error fetching cart items", error));
  }

  /**
   * Open the popup to make an order, with a date and time selection.
   */
  function openOrderPopup() {
    let popup = document.getElementById('order-popup');
    popup.style.display = 'block';

    let orderForm = document.getElementById('order-form');
    orderForm.removeEventListener('submit', handleOrderFormSubmit); // Remove any existing event listener
    orderForm.addEventListener('submit', handleOrderFormSubmit);
  }

  function handleOrderFormSubmit(event) {
    event.preventDefault();
    handleMakeOrder();
  }
  /**
   * Handles making an order, uses the api to verify it it can be made, and provides a confirmation
   * code if it can be made.
   */
  function handleMakeOrder() {
    let pickupDate = document.getElementById('pickup-date').value;
    let pickupTime = document.getElementById('pickup-time').value;

    fetch('/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pickupDate: pickupDate,
        pickupTime: pickupTime
      })
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error);
        });
      }
      return response.json();
    })
    .then(data => {
      alert('Order placed successfully! Confirmation code: ' + data.confirmationCode);
      closePopup('order-popup');
      clearCart();
    })
    .catch(error => {
      alert('Failed to place order: ' + error.message);
      console.error('Error making order:', error);
    });
  }

  function handleOrderFormSubmit(event) {
    event.preventDefault();
    handleMakeOrder();
  }

  /**
   * Creates and displays the popup for the contact us button.
   */
  function createPopUp() {
    let popup = document.createElement('div');
    popup.id = 'contactPopup';
    popup.className = 'popup';
    popup.style.display = 'block';

    let popupContent = document.createElement('div');
    popupContent.className = 'popup-content';

    let closeBtn = document.createElement('span');
    closeBtn.className = 'close';
    closeBtn.textContent = '×';

    let form = document.createElement('form');
    form.id = 'contactForm';

    form.appendChild(createFormLabel('firstName', 'First Name:'));
    form.appendChild(createFormInput('firstName', 'text'));

    form.appendChild(createFormLabel('lastName', 'Last Name:'));
    form.appendChild(createFormInput('lastName', 'text'));

    form.appendChild(createFormLabel('email', 'Email:'));
    form.appendChild(createFormInput('email', 'email'));

    form.appendChild(createFormLabel('message', 'Message:'));
    form.appendChild(createFormTextarea('message'));

    let submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Send';
    form.appendChild(submitBtn);

    popupContent.appendChild(closeBtn);
    popupContent.appendChild(form);
    popup.appendChild(popupContent);
    document.body.appendChild(popup);

    attachPopupEvents(popup);
  }

  /**
   * Creates a form label element for the popup.
   * @param {string} forAttribute - The ID belonging
   * to the form element the label is for.
   * @param {string} text - The text inside the label.
   * @returns {HTMLElement} A configured label element.
   */
  function createFormLabel(forAttribute, text) {
    let label = document.createElement('label');
    label.htmlFor = forAttribute;
    label.textContent = text;
    return label;
  }

  /**
   * Creates a form element for input.
   * @param {string} id - The ID to be assigned to the given input.
   * @param {string} type - The type given to the input element.
   * @returns {HTMLElement} A configured input element.
   */
  function createFormInput(id, type) {
    let input = document.createElement('input');
    input.type = type;
    input.id = id;
    input.name = id;
    input.required = true;
    return input;
  }

  /**
   * Creates an element for the form inputs.
   * @param {string} id - The ID to assign to be assinged to the element.
   * @returns {HTMLElement} A configured text area element.
   */
  function createFormTextarea(id) {
    let textarea = document.createElement('textarea');
    textarea.id = id;
    textarea.name = id;
    textarea.required = true;
    return textarea;
  }

  /**
   * Attaches event listeners to the popup to allow users to submit and close the form.
   * @param {HTMLElement} popup - The popup to attach the events to.
   */
  function attachPopupEvents(popup) {
    let closeBtn = popup.querySelector('.close');
    let contactForm = popup.querySelector('#contactForm');

    closeBtn.addEventListener('click', function() {
      popup.style.display = 'none';
      document.body.removeChild(popup);
    });

    window.addEventListener('click', function(event) {
      if (event.target === popup) {
        popup.style.display = 'none';
        document.body.removeChild(popup);
      }
    });

    contactForm.addEventListener('submit', function(event) {
      event.preventDefault();

      let formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
      };

      fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
        .then(response => response.json())
        .then(data => {
          if (data.errors) {
            data.errors.forEach(error => {
              alert(error.msg);
            });
          } else {
            alert('Your message has been sent successfully!');
            popup.style.display = 'none';
            document.body.removeChild(popup);
          }
        })
        .catch(error => {
          console.error('Error submitting contact form:', error);
          alert('An error occurred while submitting your message. Please try again later.');
        });
    });
  }

  /**
   * Opens a popup of the ID specified.
   * @param {string} popupId - The ID of the popup to open.
   */
  function openPopup(popupId) {
    let popup = document.getElementById(popupId);
    if (popup) {
      popup.style.display = 'block';
    }
  }

  /**
   * Closes a popup of the ID specified.
   * @param {string} popupId - The ID of the popup to close.
   */
  function closePopup(popupId) {
    let popup = document.getElementById(popupId);
    if (popup) {
      popup.style.display = 'none';
    }
  }

  /**
   * Returns the element based on the specified ID.
   * @param {string} name - The ID of the element.
   * @returns {HTMLElement} The element with the given ID.
   */
  function id(name) {
    return document.getElementById(name);
  }

  /**
   * Toggles view between the grid and list format.
   * @param {string} view - The type of view ('grid' or 'list').
   */
  function toggleView(view) {
    let shopContent = document.getElementById('shop-content');
    if (view === 'grid') {
      shopContent.classList.remove('list-view');
      shopContent.classList.add('grid-view');
    } else if (view === 'list') {
      shopContent.classList.remove('grid-view');
      shopContent.classList.add('list-view');
    }
  }
})();
