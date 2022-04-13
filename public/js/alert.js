export const hideAlert = () => {
  const elAlert = document.querySelector('.alert');
  if (elAlert) elAlert.parentElement.removeChild(elAlert);
};

// type can only be "success" or "error"
export const showAlert = (type, msg) => {
  hideAlert();

  const markup = `<div class="alert alert--${type}"> ${msg} </div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

  window.setTimeout(hideAlert, 5000);
};
