document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm');
  if (!registerForm) return;

  const emailInput = document.getElementById('username');
  const submitBtn = registerForm.querySelector('button[type="submit"]');
  const errorInput = document.getElementById('serverError');
  const successInput = document.getElementById('serverSuccess');
  const canNotify = typeof window.$ !== 'undefined' && typeof window.$.notify === 'function';
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
  const validation = new JustValidate('#registerForm', {
    errorFieldCssClass: 'just-validate-error-field',
    successFieldCssClass: 'just-validate-success-field',
  });
  
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
  
  // Initialize password toggle buttons
  document.querySelectorAll('.password-toggle').forEach(btn => {
    // set initial icon (in case template didn't include) and aria attributes
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
  
  validation
    .addField('#name', [
      {
        rule: 'minLength',
        value: 2,
        errorMessage: 'Name must be at least 2 characters',
        validateIfEmpty: true
      },
    ])
    .addField('#username', [
      {
        rule: 'required',
        errorMessage: 'Email is required',
      },
      {
        rule: 'email',
        errorMessage: 'Email must be in valid format',
      },
    ])
    .addField('#password', [
      {
        rule: 'required',
        errorMessage: 'Password is required',
      },
      {
        rule: 'minLength',
        value: 6,
        errorMessage: 'Password must be at least 6 characters',
      },
      {
        validator: (value) => {
          return passwordRegex.test(value);
        },
        errorMessage: 'Password must contain at least 1 number and 1 special character (!@#$%^&*)',
      },
    ])
    .addField('#confirmPassword', [
      {
        rule: 'required',
        errorMessage: 'Confirm password is required',
      },
      {
        validator: (value) => {
          const password = document.getElementById('password').value;
          return value === password;
        },
        errorMessage: 'Passwords do not match',
      },
    ])
    .onSuccess((event) => {
      if (emailInput) {
        emailInput.value = emailInput.value.trim().toLowerCase();
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';
      }
      event.target.submit();
    });
});
