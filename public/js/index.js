import '@babel/polyfill';

import { login, logout } from './auth';
import { displayMaps } from './mapbox';

// ELEMENTS
const loginForm = document.querySelector('.form');
const mapBox = document.getElementById('map');
const logoutBth = document.querySelector('.nav__el--logout');

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

if (logoutBth) logoutBth.addEventListener('click', logout);
