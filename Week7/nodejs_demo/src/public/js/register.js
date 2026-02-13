$(document).ready(function () {
  const $form = $('#registerForm');
  if (!$form.length) return;

  const $email = $('#username');
  const $password = $('#password');
  const $confirmPassword = $('#confirmPassword');
  const $submitBtn = $form.find('button[type="submit"]');
  const $errorInput = $('#serverError');
  const $successInput = $('#serverSuccess');
  const canNotify = typeof $.notify === 'function';
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const notify = (message, className) => {
    if (!message) return;
    if (canNotify) {
      $.notify(message, {
        className: className || 'info',
        position: 'top center',
        autoHideDelay: 5000
      });
      return;
    }
    window.alert(message);
  };

  const clearFieldError = ($field) => {
    $field.removeClass('form-error-field');
    $field.nextAll('.form-error-label').first().remove();
  };

  const setFieldSuccess = ($field) => {
    $field.removeClass('form-error-field').addClass('form-success-field');
    $field.nextAll('.form-error-label').first().remove();
  };

  const setFieldError = ($field, message) => {
    clearFieldError($field);
    $field.removeClass('form-success-field').addClass('form-error-field');
    $field.after(`<div class="form-error-label">${message}</div>`);
  };

  const clearAllErrors = () => {
    $form.find('.form-error-label').remove();
    $form.find('.form-error-field').removeClass('form-error-field');
    $form.find('.form-success-field').removeClass('form-success-field');
  };

  const validateForm = () => {
    clearAllErrors();
    let valid = true;

    const emailValue = $email.val().trim().toLowerCase();
    const passwordValue = $password.val();
    const confirmValue = $confirmPassword.val();

    if (!emailValue) {
      setFieldError($email, 'Email is required');
      valid = false;
    } else if (!emailRegex.test(emailValue)) {
      setFieldError($email, 'Email must be in valid format');
      valid = false;
    } else {
      setFieldSuccess($email);
    }

    if (!passwordValue) {
      setFieldError($password, 'Password is required');
      valid = false;
    } else if (passwordValue.length < 6) {
      setFieldError($password, 'Password must be at least 6 characters');
      valid = false;
    } else if (!passwordRegex.test(passwordValue)) {
      setFieldError($password, 'Password must contain at least 1 number and 1 special character (!@#$%^&*)');
      valid = false;
    } else {
      setFieldSuccess($password);
    }

    if (!confirmValue) {
      setFieldError($confirmPassword, 'Confirm password is required');
      valid = false;
    } else if (confirmValue !== passwordValue) {
      setFieldError($confirmPassword, 'Passwords do not match');
      valid = false;
    } else {
      setFieldSuccess($confirmPassword);
    }

    if (!valid) {
      $form.find('.form-error-field').first().focus();
      return false;
    }

    $email.val(emailValue);
    return true;
  };

  if ($errorInput.length && $errorInput.val()) {
    notify($errorInput.val(), 'error');
  }
  if ($successInput.length && $successInput.val()) {
    notify($successInput.val(), 'success');
  }

  $form.on('submit', function (event) {
    event.preventDefault();
    if (!validateForm()) return;
    $submitBtn.prop('disabled', true).text('Creating account...');
    this.submit();
  });

  // Initialize password toggle buttons
  $('.password-toggle').each(function () {
    const $btn = $(this);
    if (!$btn.html() || $btn.html().trim() === '') {
      $btn.html('<i class="bi bi-eye"></i>');
    }
  });

  $('.password-toggle').on('click', function () {
    const $btn = $(this);
    const targetId = $btn.attr('data-target');
    const input = document.getElementById(targetId);
    if (!input) return;

    if (input.type === 'password') {
      input.type = 'text';
      $btn.attr('aria-pressed', 'true');
      $btn.attr('aria-label', 'Hide password');
      $btn.find('i').removeClass('bi-eye').addClass('bi-eye-slash');
    } else {
      input.type = 'password';
      $btn.attr('aria-pressed', 'false');
      $btn.attr('aria-label', 'Show password');
      $btn.find('i').removeClass('bi-eye-slash').addClass('bi-eye');
    }
  });
});
