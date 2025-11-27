// Login form - show server-side error/success messages with notify.js
document.addEventListener('DOMContentLoaded', function() {
  const errorInput = document.getElementById('serverError');
  const successInput = document.getElementById('serverSuccess');
  
  if (errorInput && errorInput.value) {
    $.notify(errorInput.value, { 
      className: 'error',
      position: 'top center',
      autoHideDelay: 5000
    });
  }
  
  if (successInput && successInput.value) {
    $.notify(successInput.value, { 
      className: 'success',
      position: 'top center',
      autoHideDelay: 5000
    });
  }
});
