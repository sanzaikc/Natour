import axios from 'axios';

export const login = async (email, password) => {
  console.log('email', email);
  console.log('password', password);
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/login',
      data: {
        email,
        password,
      },
    });

    if (res.status === 200) {
      alert('Logged in successfully');

      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    alert(err.response.data.message);
  }
};
