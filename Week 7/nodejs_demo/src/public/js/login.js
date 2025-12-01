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

  // Initialize password toggle for login page (emoji)
  document.querySelectorAll('.password-toggle').forEach(btn => {
    if (!btn.innerText || btn.innerText.trim() === '') btn.innerText = '👁️';
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('aria-label', 'Hide password');
        btn.innerText = '🙈';
      } else {
        input.type = 'password';
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-label', 'Show password');
        btn.innerText = '👁️';
      }
    });
  });
});
