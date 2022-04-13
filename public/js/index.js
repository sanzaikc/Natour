import '@babel/polyfill';

import { login } from './login';
import { displayMaps } from './mapbox';

// ELEMENTS
const loginForm = document.querySelector('.form');
const mapBox = document.getElementById('map');

// VALUES

// DELEGATIONS
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);

  displayMaps(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}
