import axios from 'axios';

import { showAlert } from './alert';

export const updateProfile = async (name, email) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/me',
      data: {
        name,
        email,
      },
    });

    if (res.status === 200) {
      showAlert('success', 'Profile updated successfully!');

      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updatePassword = async (
  passwordCurrent,
  password,
  passwordConfirm
) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/update-password',
      data: {
        passwordCurrent,
        password,
        passwordConfirm,
      },
    });

    if (res.status === 200) {
      showAlert('success', 'Password updated successfully!');

      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
