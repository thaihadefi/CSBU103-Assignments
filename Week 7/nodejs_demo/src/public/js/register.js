// Registration form validation using JustValidate
const validation = new JustValidate('#registerForm', {
  errorFieldCssClass: 'just-validate-error-field',
  successFieldCssClass: 'just-validate-success-field',
});

// Custom password validation rule
const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;

// Check for server-side error/success messages and show notify popup
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
    // Submit the form when validation passes
    console.log('Form validation passed - submitting form');
    event.target.submit();
  });
