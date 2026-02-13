// Login form - show server-side error/success messages with notify.js
document.addEventListener('DOMContentLoaded', function() {
  const errorInput = document.getElementById('serverError');
  const successInput = document.getElementById('serverSuccess');
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('username');
  const submitBtn = loginForm ? loginForm.querySelector('button[type="submit"]') : null;
  const canNotify = typeof window.$ !== 'undefined' && typeof window.$.notify === 'function';
  
  if (errorInput && errorInput.value) {
    if (canNotify) {
      $.notify(errorInput.value, { 
        className: 'error',
        position: 'top center',
        autoHideDelay: 5000
      });
    }
  }
  
  if (successInput && successInput.value) {
    if (canNotify) {
      $.notify(successInput.value, { 
        className: 'success',
        position: 'top center',
        autoHideDelay: 5000
      });
    }
  }

  if (loginForm && emailInput && submitBtn) {
    loginForm.addEventListener('submit', function() {
      emailInput.value = emailInput.value.trim().toLowerCase();
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in...';
    });
  }

  // Initialize password toggle for login page.
  document.querySelectorAll('.password-toggle').forEach(btn => {
    if (!btn.innerHTML || btn.innerHTML.trim() === '') btn.innerHTML = '<i class="bi bi-eye"></i>';
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('aria-label', 'Hide password');
        btn.querySelector('i').classList.remove('bi-eye');
        btn.querySelector('i').classList.add('bi-eye-slash');
      } else {
        input.type = 'password';
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-label', 'Show password');
        btn.querySelector('i').classList.remove('bi-eye-slash');
        btn.querySelector('i').classList.add('bi-eye');
      }
    });
  });
});
