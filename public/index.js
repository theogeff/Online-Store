"use strict";

(function() {
  window.addEventListener("load", init);

  const UNAUTHORIZED = 401;

  /**
   * Initializes the page by setting up event listeners and checking on the login status.
   */
  function init() {
    checkLoginStatus();
    setEventListeners();
    initializePopups();
    searchOrder();
  }

  /**
   * Sets up event listeners for the elements on the page.
   */
  function setEventListeners() {
    let contactBtn = id('contact-btn');
    contactBtn.addEventListener("click", createPopUp);

    let logo = document.getElementById('logo');
    if (logo) {
      logo.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }

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

    let gridViewBtn = id('grid-view-btn');
    let listViewBtn = id('list-view-btn');
    gridViewBtn.addEventListener('click', () => toggleView('grid'));
    listViewBtn.addEventListener('click', () => toggleView('list'));
  }

  /**
   * Sets up search and ordering functionalities by setting up event listeners.
   */
  function searchOrder() {
    let searchIcon = id('search-icon');
    if (searchIcon) {
      searchIcon.addEventListener('click', () => {
        openPopup('search-popup');
      });
    }

    let makeOrderBtn = id('make-order-btn');
    makeOrderBtn.addEventListener('click', openOrderPopup);
    updateMakeOrderButton();

    let searchForm = document.getElementById('search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', handleSearch);
    }
  }

  /**
   * Verifies the login status of the user.
   */
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

  /**
   * Fetches and renders products from the given url.
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
   * @param {Array} data - The set of product objects to display.
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
        let itemElement = createProductItemElement(item);
        itemList.appendChild(itemElement);
      }
    });
    categorySection.appendChild(itemList);
    shopContent.appendChild(categorySection);
  }

  /**
   * Creates a product item element.
   * @param {Object} item - The product item object.
   * @returns {HTMLElement} - The created product item element.
   */
  function createProductItemElement(item) {
    let itemImage = document.createElement('img');
    itemImage.src = item.imgUrl;
    itemImage.alt = item.name;
    itemImage.classList.add('product-image');

    let itemDescription = document.createElement('p');
    itemDescription.textContent = `${item.name} - $${item.price}`;

    let itemElement = document.createElement('li');
    itemElement.dataset.productId = item.id;
    itemElement.appendChild(itemImage);
    itemElement.appendChild(itemDescription);
    itemElement.addEventListener('click', () => openQuantityPopup(item.id));

    return itemElement;
  }

  /**
   * Opens the popup allowing users to choose a quantity and add to cart.
   * @param {number} productId - The ID of the clicked product.
   */
  function openQuantityPopup(productId) {
    let popup = document.getElementById('quantity-popup');
    let quantityForm = document.getElementById('quantity-form');

    quantityForm.dataset.productId = productId;

    // Remove previous event listeners to avoid duplicates
    let newForm = quantityForm.cloneNode(true);
    quantityForm.parentNode.replaceChild(newForm, quantityForm);
    newForm.dataset.productId = productId;

    fetchProductDetails(productId);

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
   * Fetches product details for a given product ID.
   * @param {number} productId - The ID of the product.
   */
  function fetchProductDetails(productId) {
    fetch(`/api/product/${productId}`)
      .then(response => response.json())
      .then(data => {
        document.getElementById('popup-product-name').textContent = data.name;
        document.getElementById('popup-product-img').src = data.imgUrl;
        document.getElementById('popup-product-price').textContent = `Price: $${data.price}`;
        document.getElementById('popup-product-availability').textContent = `Availability:
        ${data.availability}`;
        document.getElementById('quantity').value = 1; // Reset quantity to 1
      })
      .catch(error => console.error('Error fetching product details:', error));
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
        if (response.status === UNAUTHORIZED) {
          showAlert('You need to be logged in to add items to the cart.');
          throw new Error('User not logged in');
        }
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(updateCartDisplay())
      .catch(error => console.error('Error adding to cart:', error));
  }

  /**
   * Handles the submission of search forms.
   * @param {Event} event - The event object.
   */
  function handleSearch(event) {
    event.preventDefault();
    let searchTerm = document.getElementById('search-input').value;
    fetchAndRenderProducts(`/api/search?term=${encodeURIComponent(searchTerm)}`, 'Search Results');
    closePopup('search-popup');
  }

  /**
   * Handles the click on the account icon.
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
   * Handles a signed in user signing out.
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
      .then(showAlert('You have been signed out.'))
      .then(closePopup('account-popup-logged-in'))
      .then(window.location.reload())
      .catch(error => console.error('Error logging out:', error));
  }

  /**
   * Fetches the order history for the user.
   */
  function fetchOrderHistory() {
    fetch('/api/order-history')
      .then(response => response.json())
      .then(data => {
        renderOrderHistory(data);
        closePopup('account-popup-logged-in');
        openPopup('order-history-popup');
      })
      .catch(error => console.error('Error fetching order history:', error));
  }

  /**
   * Displays the order history on the page.
   * @param {Array} data - The array of order history objects.
   */
  function renderOrderHistory(data) {
    let orderHistoryList = document.getElementById('order-history-list');
    orderHistoryList.innerHTML = '';

    if (data.length === 0) {
      let emptyMessage = document.createElement('p');
      emptyMessage.textContent = 'No order history available.';
      orderHistoryList.appendChild(emptyMessage);
    } else {
      data.forEach(order => {
        let orderElement = createOrderElement(order);
        orderHistoryList.appendChild(orderElement);
      });
    }
  }

  /**
   * Creates an order element.
   * @param {Object} order - The order object.
   * @returns {HTMLElement} - The created order element.
   */
  function createOrderElement(order) {
    let orderElement = document.createElement('div');
    orderElement.classList.add('order');
    let orderDetails = document.createElement('p');
    orderDetails.textContent = `Order Date: ${order.orderDate}, Status: ${order.status},
    Total: $${order.totalPrice.toFixed(2)}, Confirmation Code: ${order.confirmationCode}`;
    orderElement.appendChild(orderDetails);

    let orderItems = document.createElement('ul');
    order.items.split(', ').forEach(item => {
      let itemElement = document.createElement('li');
      itemElement.textContent = item;
      orderItems.appendChild(itemElement);
    });
    orderElement.appendChild(orderItems);

    return orderElement;
  }

  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('register-form').addEventListener('submit', handleRegister);
  document.getElementById('create-account-link').addEventListener('click', (event) => {
    event.preventDefault();
    closePopup('account-popup');
    openPopup('register-popup');
  });

  /**
   * Handles the submission of a login event.
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
      body: JSON.stringify({username, password})
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
          showAlert(data.message);
          closePopup('account-popup');
        }
      })
      .catch(error => handleLoginError(error));
  }

  /**
   * Handles login errors.
   * @param {Error} error - The error object.
   */
  function handleLoginError(error) {
    if (error.message.includes('Username not found')) {
      showAlert('Username not found. Try creating an account.');
    } else if (error.message.includes('Incorrect password')) {
      showAlert('Incorrect password!');
    } else {
      console.error('Error logging in:', error);
      showAlert('An unexpected error occurred. Please try again.');
    }
  }

  /**
   * Handles the submission of a registration form.
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
      body: JSON.stringify({username, email, password})
    })
      .then(response => response.json())
      .then(data => {
        if (data.userId) {
          showAlert('Registration successful');
          closePopup('register-popup');
        } else {
          showAlert('Registration failed...');
        }
      })
      .catch(error => console.error('Error registering:', error));
  }

  /**
   * Updates the items displayed in the cart.
   */
  function updateCartDisplay() {
    fetch('/api/cart')
      .then(response => response.json())
      .then(cartItems => {
        renderCartItems(cartItems);
        updateMakeOrderButton();
      })
      .catch(error => console.error("Error fetching cart items", error));
  }

  /**
   * Displays the cart items on the page.
   * @param {Array} cartItems - The array of cart item objects.
   */
  function renderCartItems(cartItems) {
    let cartItemsList = document.getElementById("cart-items");
    cartItemsList.innerHTML = ""; // Clear existing cart items

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      let emptyMessage = document.createElement("li");
      emptyMessage.textContent = "Your cart is empty.";
      cartItemsList.appendChild(emptyMessage);
    } else {
      cartItems.forEach(item => {
        let itemElement = createCartItemElement(item);
        cartItemsList.appendChild(itemElement);
      });
    }
  }

  /**
   * Creates a cart item element.
   * @param {Object} item - The cart item object.
   * @returns {HTMLElement} - The created cart item element.
   */
  function createCartItemElement(item) {
    let itemElement = document.createElement("li");

    let minusButton = document.createElement("button");
    minusButton.textContent = "-";
    minusButton.classList.add("quantity-btn");
    minusButton.addEventListener('click', () =>
      updateCartItemQuantity(item.cartItemId, item.quantity - 1)
    );

    let plusButton = document.createElement("button");
    plusButton.textContent = "+";
    plusButton.classList.add("quantity-btn");
    plusButton.addEventListener('click', () =>
      updateCartItemQuantity(item.cartItemId, item.quantity + 1)
    );

    let quantitySpan = document.createElement("span");
    quantitySpan.textContent = `${item.quantity}`;

    itemElement.appendChild(minusButton);
    itemElement.appendChild(quantitySpan);
    itemElement.appendChild(plusButton);
    itemElement.appendChild(document.createTextNode(` ${item.name} - $${item.price}`));

    return itemElement;
  }

  /**
   * Clears all items inside the cart.
   */
  function clearCart() {
    fetch('/api/cart', {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => {
        renderEmptyCart(data.message);
        updateMakeOrderButton();
      })
      .catch(error => console.error("Error clearing cart", error));
  }

  /**
   * Displays the empty cart messsage.
   * @param {string} message - The empty cart message.
   */
  function renderEmptyCart(message) {
    let cartItemsList = document.getElementById("cart-items");
    cartItemsList.innerHTML = ""; // Clear existing cart items
    let emptyMessage = document.createElement("li");
    emptyMessage.textContent = message;
    cartItemsList.appendChild(emptyMessage);
  }

  /**
   * Updates the quantity of a cart item.
   * @param {number} cartItemId - The ID of the cart item.
   * @param {number} newQuantity - The new quantity of the cart item.
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
        .then(updateCartDisplay())
        .catch(error => console.error('Error updating cart item quantity:', error));
    } else {
      removeCartItem(cartItemId);
    }
  }

  /**
   * Removes a cart item.
   * @param {number} cartItemId - The ID of the cart item to be removed.
   */
  function removeCartItem(cartItemId) {
    fetch(`/api/cart/${cartItemId}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(updateCartDisplay())
      .catch(error => console.error('Error removing cart item:', error));
  }

  /**
   * Updates the state (enabled or disables) of the make order button based on the cart contents.
   */
  function updateMakeOrderButton() {
    fetch('/api/cart')
      .then(response => response.json())
      .then(cartItems => {
        let makeOrderBtn = id('make-order-btn');
        makeOrderBtn.disabled = !(Array.isArray(cartItems) && cartItems.length > 0);
      })
      .catch(error => console.error("Error fetching cart items", error));
  }

  /**
   * Opens the order popup.
   */
  function openOrderPopup() {
    let popup = document.getElementById('order-popup');
    popup.style.display = 'block';

    let orderForm = document.getElementById('order-form');
    orderForm.removeEventListener('submit', handleOrderFormSubmit);
    orderForm.addEventListener('submit', handleOrderFormSubmit);
  }

  /**
   * Handles the submission of an order form.
   * @param {Event} event - The event object.
   */
  function handleOrderFormSubmit(event) {
    event.preventDefault();
    handleMakeOrder();
  }

  /**
   * Handles making an order.
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
        showAlert('Order placed successfully! Confirmation code: ' + data.confirmationCode);
        closePopup('order-popup');
        clearCart();
      })
      .catch(error => {
        console.error('Error making order:', error);
      });
  }

  /**
   * Creates a contact popup.
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
   * Creates a form label element.
   * @param {string} forAttribute - The value for the 'for' attribute of the label.
   * @param {string} text - The text content of the label.
   * @returns {HTMLElement} - The created label element.
   */
  function createFormLabel(forAttribute, text) {
    let label = document.createElement('label');
    label.htmlFor = forAttribute;
    label.textContent = text;
    return label;
  }

  /**
   * Creates a form input element.
   * @param {string} id - The ID of the input element.
   * @param {string} type - The type of the input element.
   * @returns {HTMLElement} - The created input element.
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
   * Creates a form textarea element.
   * @param {string} id - The ID of the textarea element.
   * @returns {HTMLElement} - The created textarea element.
   */
  function createFormTextarea(id) {
    let textarea = document.createElement('textarea');
    textarea.id = id;
    textarea.name = id;
    textarea.required = true;
    return textarea;
  }

  /**
   * Attaches events to a popup element.
   * @param {HTMLElement} popup - The popup element.
   */
  function attachPopupEvents(popup) {
    attachPopupCloseEvent(popup);
    attachPopupWindowEvent(popup);
    attachPopupFormEvent(popup);
  }

  /**
   * Attaches the close event to a popup element.
   * @param {HTMLElement} popup - The popup element.
   */
  function attachPopupCloseEvent(popup) {
    let closeBtn = popup.querySelector('.close');
    closeBtn.addEventListener('click', function() {
      popup.style.display = 'none';
      document.body.removeChild(popup);
    });
  }

  /**
   * Attaches the window click event to a popup element.
   * @param {HTMLElement} popup - The popup element.
   */
  function attachPopupWindowEvent(popup) {
    window.addEventListener('click', function(event) {
      if (event.target === popup) {
        popup.style.display = 'none';
        document.body.removeChild(popup);
      }
    });
  }

  /**
   * Attaches the form submit event to a popup element.
   * @param {HTMLElement} popup - The popup element.
   */
  function attachPopupFormEvent(popup) {
    let contactForm = popup.querySelector('#contactForm');
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
              showAlert(error.msg);
            });
          } else {
            showAlert('Your message has been sent successfully!');
            popup.style.display = 'none';
            document.body.removeChild(popup);
          }
        })
        .catch(error => {
          console.error('Error submitting contact form:', error);
          showAlert('An error occurred while submitting your message. Please try again later.');
        });
    });
  }

  /**
   * Opens a popup by its ID.
   * @param {string} popupId - The ID of the popup to open.
   */
  function openPopup(popupId) {
    let popup = document.getElementById(popupId);
    if (popup) {
      popup.style.display = 'block';
    }
  }

  /**
   * Closes a popup by its ID.
   * @param {string} popupId - The ID of the popup to close.
   */
  function closePopup(popupId) {
    let popup = document.getElementById(popupId);
    if (popup) {
      popup.style.display = 'none';
    }
  }

  /**
   * Gets an element by its ID.
   * @param {string} name - The ID of the element to get.
   * @returns {HTMLElement} - The element with the specified ID.
   */
  function id(name) {
    return document.getElementById(name);
  }

  /**
   * Toggles the view between grid and list.
   * @param {string} view - The view type ('grid' or 'list').
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

  /**
   * Displays an alert with a given message.
   * @param {string} message - The message to display in the alert.
   */
  function showAlert(message) {
    let alertContainer = document.createElement('div');
    alertContainer.className = 'custom-alert';
    alertContainer.textContent = message;

    document.body.appendChild(alertContainer);

    setTimeout(() => {
      alertContainer.remove();
    }, 3000); // Adjust the timeout as needed
  }

  /**
   * Initializes popups by setting up event listeners.
   */
  function initializePopups() {
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
      fetchAndRenderProducts('/api/products/Viennoiseries', 'Viennoiseries');

      shopNavList.addEventListener('click', (event) => {
        event.preventDefault();
        let category = event.target.getAttribute('data-category');
        fetchAndRenderProducts(`/api/products/${category}`, category);
      });
    }
  }
})();
