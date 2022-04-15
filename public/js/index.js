import '@babel/polyfill';

import { login, logout } from './auth';
import { displayMaps } from './mapbox';
import { updateProfile, updatePassword } from './updateSettings';

// ELEMENTS
const loginForm = document.querySelector('.form--login');
const mapBox = document.getElementById('map');
const logoutBth = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const changePasswordForm = document.querySelector('.form-user-password');

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

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const form = new FormData();

    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateProfile(form);
  });
}

if (changePasswordForm) {
  console.log('passsword');

  changePasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const currentPass = document.getElementById('password-current').value;
    const newPass = document.getElementById('password').value;
    const confirmPass = document.getElementById('password-confirm').value;

    updatePassword(currentPass, newPass, confirmPass);
  });
}
