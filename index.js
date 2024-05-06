/**
 * Contact Us Popup
 *
 * This script creates a poppu form for when users press the 'contact us' button.
 * The popup requires uses to nput fields such as their first name, last name, email address,
 * and a message. It ensures that the popup can handle all interactions, including submitting and
 * closing the form.
 */

"use strict";

(function() {
  /**
   * Initializes the DOM once everything is fully loaded.
   */
  window.addEventListener("load", init);

  /**
   * Adds event listeners once the DOM content has fully loaded.
   */
  function init() {
    let contactBtn = id('contact-btn');
    contactBtn.addEventListener("click", createPopUp);
  }

  /**
   * Creates and display the popup for when the contact us button is clicked.
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
      let formData = new FormData(contactForm);
      popup.style.display = 'none';
      document.body.removeChild(popup);
    });
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} name - element ID.
   * @returns {object} - DOM object associated with id.
   */
  function id(name) {
    return document.getElementById(name);
  }
})();
