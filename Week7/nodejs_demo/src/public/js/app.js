$(document).ready(function () {
    const $form = $('#createUserForm');
    const $createBtn = $('#btn-create');
    const $clearBtn = $('#btn-clear');
    const csrfToken = $('#csrfToken').val();
    const canNotify = typeof $.notify === 'function';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;

    const notify = (message, className, autoHideDelay) => {
        if (canNotify) {
            $.notify(message, {
                className: className || 'info',
                position: 'top center',
                autoHideDelay: autoHideDelay || 4000
            });
            return;
        }
        window.alert(message);
    };

    const setFormBusy = (busy, label) => {
        $createBtn.prop('disabled', busy);
        $clearBtn.prop('disabled', busy);
        if (busy) {
            $createBtn.text(label || 'Saving...');
            return;
        }
        const userId = $form.find('input[name="user_id"]').val();
        $createBtn.text(userId ? 'Update' : 'Create');
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

    const resetToCreateMode = () => {
        $form[0].reset();
        clearAllErrors();
        $form.find('input[name="user_id"]').val('');
        const $pwd = $form.find('input[name="password"]');
        $pwd.prop('disabled', false);
        $pwd.prop('type', 'password');
        $pwd.val('');
        $pwd.closest('.input-group').find('.password-toggle').show();
        $form.find('input[name="username"]').prop('disabled', false);
        setFormBusy(false);
    };

    const validateForm = () => {
        clearAllErrors();
        let valid = true;
        const userId = $form.find('input[name="user_id"]').val();
        const $email = $form.find('input[name="username"]');
        const $name = $form.find('input[name="name"]');
        const $password = $form.find('input[name="password"]');
        const $gender = $form.find('input[name="gender"]:checked');

        const emailValue = $email.val().trim().toLowerCase();
        const nameValue = $name.val().trim();
        const passwordValue = $password.val();

        if (!nameValue) {
            setFieldError($name, 'Name is required');
            valid = false;
        } else if (nameValue.length < 2) {
            setFieldError($name, 'Name must be at least 2 characters');
            valid = false;
        } else {
            setFieldSuccess($name);
        }

        if (!$gender.length) {
            setFieldError($('#female'), 'Gender is required');
            $form.find('input[name="gender"]').removeClass('form-success-field');
            valid = false;
        } else {
            $form.find('input[name="gender"]').removeClass('form-error-field');
            $form.find('input[name="gender"]:checked').addClass('form-success-field');
        }

        if (!userId) {
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
                setFieldError($password, 'Password must contain at least 1 number and 1 special character');
                valid = false;
            } else {
                setFieldSuccess($password);
            }
        }

        if (!valid) {
            $form.find('.form-error-field').first().focus();
            return false;
        }

        $email.val(emailValue);
        $name.val(nameValue);
        return true;
    };

    const buildUserRow = (data) => {
        const username = data && data.username ? String(data.username) : '';
        const name = data && data.name ? String(data.name) : '';
        const gender = data && data.gender ? String(data.gender) : '';
        const userId = data && data.id ? String(data.id) : '';

        const $row = $('<tr>').addClass('user-id').attr('data-userid', userId);
        $row.append($('<td>').attr('scope', 'row').text(userId));
        $row.append($('<td>').addClass('username').text(username));
        $row.append($('<td>').addClass('name').text(name));
        $row.append($('<td>').addClass('gender').text(gender));

        const $actions = $('<div>').addClass('action-group');
        const $deleteBtn = $('<button>')
            .attr('type', 'button')
            .attr('data-id', userId)
            .attr('aria-label', `Delete user ${username}`)
            .addClass('del-btn btn btn-sm btn-outline-danger')
            .text('Delete');
        const $updateBtn = $('<button>')
            .attr('type', 'button')
            .attr('data-id', userId)
            .attr('aria-label', `Update user ${username}`)
            .addClass('update-btn btn btn-sm btn-outline-warning')
            .text('Update');
        $actions.append($deleteBtn, $updateBtn);
        $row.append($('<td>').append($actions));

        return $row;
    };

    // Initialize password toggle for the admin create form (index page)
    $form.on('click', '.password-toggle', function () {
        const btn = $(this);
        const targetId = btn.attr('data-target');
        const input = document.getElementById(targetId);
        if (!input || $(input).prop('disabled')) return;
        if (input.type === 'password') {
            input.type = 'text';
            btn.attr('aria-pressed', 'true');
            btn.attr('aria-label', 'Hide password');
            btn.find('i').removeClass('bi-eye').addClass('bi-eye-slash');
        } else {
            input.type = 'password';
            btn.attr('aria-pressed', 'false');
            btn.attr('aria-label', 'Show password');
            btn.find('i').removeClass('bi-eye-slash').addClass('bi-eye');
        }
    });

    const submitCreateForm = function (event) {
        if (event && event.preventDefault) event.preventDefault();
        if (!validateForm()) return;

        const userId = $form.find('input[name="user_id"]').val();
        const nameVal = $form.find('input[name=name]').val().trim();
        const genderVal = $form.find('input[name=gender]:checked').val() || '';
        const usernameVal = $form.find('input[name=username]').val().trim().toLowerCase();
        const passwordVal = $form.find('input[name=password]').val();

        let formData = {};
        if (!userId) {
            formData = {
                username: usernameVal,
                name: nameVal,
                gender: genderVal,
                password: passwordVal
            };
            setFormBusy(true, 'Creating...');
        } else {
            formData = { name: nameVal, gender: genderVal };
            setFormBusy(true, 'Updating...');
        }

        if (!userId) {
            $.ajax({
                method: 'POST',
                url: '/users',
                headers: { 'x-csrf-token': csrfToken },
                data: JSON.stringify(formData),
                contentType: 'application/json',
                encode: true
            }).done(function (resp) {
                const status = resp && resp.status;
                const data = resp && resp.data;
                if (status && data) {
                    $('#userList tbody').append(buildUserRow(data));
                    notify('User created', 'success', 3000);
                    resetToCreateMode();
                } else {
                    setFormBusy(false);
                    notify((resp && resp.msg) || 'Unable to create user', 'error');
                }
            }).fail(function (xhr) {
                setFormBusy(false);
                const body = xhr && xhr.responseJSON;
                if (body && body.field) {
                    const fieldName = body.field;
                    const $input = $(`#createUserForm [name="${fieldName}"]`);
                    $input.next('.form-error-label').remove();
                    $input.removeClass('form-success-field').addClass('form-error-field');
                    $input.after(`<div class="form-error-label">${(body && body.msg) || 'Invalid value'}</div>`);
                    $input.focus();
                } else {
                    notify((body && body.msg) || 'Server error creating user', 'error');
                }
            });
            return;
        }

        $.ajax({
            method: 'PUT',
            url: `/users/${userId}`,
            headers: { 'x-csrf-token': csrfToken },
            data: JSON.stringify(formData),
            contentType: 'application/json',
            encode: true
        }).done(function (resp) {
            if (resp && resp.status) {
                if (resp.updated === false) {
                    notify(resp.msg || 'No changes detected', 'info');
                    setFormBusy(false);
                    return;
                }

                const data = resp.data || {};
                const row = $(`tr[data-userid="${userId}"]`);
                row.find('td.username').text(data.username || row.find('td.username').text());
                row.find('td.name').text(data.name || row.find('td.name').text());
                row.find('td.gender').text(data.gender || row.find('td.gender').text());
                notify(resp.msg || 'User updated', 'success');
                resetToCreateMode();
            } else {
                setFormBusy(false);
                notify((resp && resp.msg) || 'Unable to update user', 'error');
            }
        }).fail(function (xhr) {
            setFormBusy(false);
            const body = xhr && xhr.responseJSON;
            notify((body && body.msg) || 'Server error updating user', 'error');
        });
    };

    $form.on('submit', function (event) {
        submitCreateForm(event);
    });

    // Use event delegation for delete and update buttons so dynamic rows work
    $('#userList').on('click', '.del-btn', function () {
        const $btn = $(this);
        const userId = $btn.attr('data-id');
        $btn.prop('disabled', true);

        $.ajax({
            method: 'DELETE',
            url: `/users/${userId}`,
            headers: { 'x-csrf-token': csrfToken },
            contentType: 'application/json'
        }).done(function (resp) {
            if (resp && resp.status) {
                $(`tr[data-userid="${userId}"]`).remove();
                notify('User deleted', 'success');
            } else {
                $btn.prop('disabled', false);
                notify((resp && resp.msg) || 'Unable to delete user', 'error');
            }
        }).fail(function (xhr) {
            $btn.prop('disabled', false);
            const body = xhr && xhr.responseJSON;
            notify((body && body.msg) || 'Server error deleting user', 'error');
        });
    });

    $('#userList').on('click', '.update-btn', function () {
        const userId = $(this).attr('data-id');
        $form.find('input[name="user_id"]').val(userId);
        $form.find('input[name=username]').val($(`tr[data-userid="${userId}"] td.username`).text());
        $form.find('input[name=username]').prop('disabled', true);
        $form.find('input[name=name]').val($(`tr[data-userid="${userId}"] td.name`).text());
        $form.find('input[name=gender]').prop('checked', false);
        $(`#createUserForm input[value="${$(`tr[data-userid="${userId}"] td.gender`).text()}"]`).prop('checked', true);

        const $pwd = $form.find('input[name=password]');
        $pwd.prop('type', 'password');
        $pwd.val('********');
        $pwd.prop('disabled', true);
        $pwd.closest('.input-group').find('.password-toggle').hide();
        setFormBusy(false);
    });

    $('#btn-clear').on('click', function () {
        resetToCreateMode();
    });
});
