$(document).ready(function () {
    // Initialize password toggle for the admin create form (index page)
    $('#createUserForm').on('click', '.password-toggle', function (e) {
        const btn = $(this);
        const targetId = btn.attr('data-target');
        const input = document.getElementById(targetId);
        if (!input || $(input).prop('disabled')) return; // don't toggle when disabled (update mode)
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
    // Handler called by JustValidate on successful validation
    window.submitCreateForm = function(event) {
        // event may be the submit event from JustValidate
        if (event && event.preventDefault) event.preventDefault();

        const userId = $('#createUserForm input[name="user_id"]').val();
        let formData = {}
        const nameVal = $('#createUserForm input[name=name]').val().trim()
        const genderVal = $('#createUserForm input[name=gender]:checked').val() || ''

        if (!userId) {
            // Create: include username and password
            formData = {
                username: $('#createUserForm input[name=username]').val().trim(),
                name: nameVal,
                gender: genderVal,
                password: $('#createUserForm input[name=password]').val()
            }
        } else {
            // Update: do not send username (disallowed here), only send updatable fields
            formData = { name: nameVal, gender: genderVal }
        }

        if (!userId) {
            // Create
            $.ajax({
                method: 'POST',
                url: '/users',
                data: JSON.stringify(formData),
                contentType: 'application/json',
                encode: true
            }).done(function(resp) {
                const { status, data, tempPassword } = resp || {};
                if (status && data) {
                    // append row
                    $('#userList tbody').append(
                        `<tr class="user-id" data-userid="${data.id}"><td scope="row">${data.id}</td><td class="username">${data.username}</td><td class="name">${data.name}</td><td class="gender">${data.gender}</td><td><button class="del-btn btn btn-danger" data-id="${data.id}">Delete</button><button class="update-btn btn btn-warning" data-id="${data.id}">Update</button></td></tr>`
                    );
                    // notify success
                    $.notify('User created', { className: 'success', position: 'top center', autoHideDelay: 3000 });
                    if (tempPassword) {
                        // show temp password if server generated one (shouldn't happen because autogen removed), but keep for safety
                        $.notify('Temporary password: ' + tempPassword, { className: 'info', position: 'top center', autoHideDelay: 10000 });
                    }
                    // clear form
                    $('#createUserForm')[0].reset();
                } else {
                    $.notify((resp && resp.msg) || 'Unable to create user', { className: 'error', position: 'top center' });
                }
            }).fail(function(xhr) {
                const body = xhr && xhr.responseJSON;
                // If server provided a field name for the validation error, show it inline under that field
                if (body && body.field) {
                    const fieldName = body.field;
                    // find the input by name or id inside the create form
                    const $input = $(`#createUserForm [name="${fieldName}"]`);
                    // remove any previous inline error next to this input
                    $input.next('.just-validate-error-label').remove();
                    $input.removeClass('just-validate-success-field').addClass('just-validate-error-field');
                    $input.after(`<div class="just-validate-error-label">${(body && body.msg) || 'Invalid value'}</div>`);
                    // focus the field for convenience
                    $input.focus();
                } else {
                    $.notify((body && body.msg) || 'Server error creating user', { className: 'error', position: 'top center' });
                }
            });
        } else {
            // Update
            $.ajax({
                method: 'PUT',
                url: `/users/${userId}`,
                data: JSON.stringify(formData),
                contentType: 'application/json',
                encode: true
            }).done(function(resp) {
                // Resp format: { status:true, updated: true|false, data: {...}, msg: '...' }
                if (resp && resp.status) {
                    if (resp.updated === false) {
                        $.notify(resp.msg || 'No changes detected', { className: 'info', position: 'top center' });
                    } else {
                        const data = resp.data || {}
                        // update row (username may not be returned since we disallow changing it here)
                        const row = $(`tr[data-userid="${userId}"]`);
                        row.find('td.username').text(data.username || row.find('td.username').text());
                        row.find('td.name').text(data.name || row.find('td.name').text());
                        row.find('td.gender').text(data.gender || row.find('td.gender').text());
                        $.notify(resp.msg || 'User updated', { className: 'success', position: 'top center' });
                    }
                    // reset form
                    $('#createUserForm')[0].reset();
                    $('#createUserForm input[name="user_id"]').val('');
                    $('#createUserForm #btn-create').text('Create');
                } else {
                    $.notify((resp && resp.msg) || 'Unable to update user', { className: 'error', position: 'top center' });
                }
            }).fail(function(xhr) {
                const body = xhr && xhr.responseJSON;
                // For update errors keep existing notify behaviour (no specific field expected)
                $.notify((body && body.msg) || 'Server error updating user', { className: 'error', position: 'top center' });
            });
        }
    };

    // Use event delegation for delete and update buttons so dynamic rows work
    $('#userList').on('click', '.del-btn', function (e) {
        const userId = $(this).attr('data-id');
        $.ajax({ method: 'DELETE', url: `/users/${userId}`, contentType: 'application/json' })
        .done(function (resp) {
            if (resp && resp.status) {
                $(`tr[data-userid="${userId}"]`).remove();
                $.notify('User deleted', { className: 'success', position: 'top center' });
            } else {
                $.notify((resp && resp.msg) || 'Unable to delete user', { className: 'error', position: 'top center' });
            }
        }).fail(function () {
            $.notify('Server error deleting user', { className: 'error', position: 'top center' });
        });
    });

    $('#userList').on('click', '.update-btn', function (e) {
        const userId = $(this).attr('data-id');
        $('#createUserForm input[name="user_id"]').val(userId);
        // populate username but disable editing to avoid changing email from the index UI
        $('#createUserForm input[name=username]').val($(`tr[data-userid="${userId}"] td.username`).text());
        $('#createUserForm input[name=username]').prop('disabled', true);
        $('#createUserForm input[name=name]').val($(`tr[data-userid="${userId}"] td.name`).text());
        $('#createUserForm input[name=gender]').prop('checked', false);
        $(`#createUserForm input[value="${$(`tr[data-userid="${userId}"] td.gender`).text()}"]`).prop('checked', true);
        // Disable password input during update so password cannot be changed from the index UI
        const $pwd = $('#createUserForm input[name=password]');
        $pwd.prop('type', 'password');
        // show masked placeholder (do not reveal real password). Using fixed bullets to indicate a hidden password.
        $pwd.val('********');
        $pwd.prop('disabled', true);
    // hide the toggle button when updating
    $pwd.closest('.input-group').find('.password-toggle').hide();
        $('#createUserForm #btn-create').text('Update');
    });

    $('#createUserForm button.btn-warning').on('click', function (e) {
        $('#createUserForm')[0].reset();
        $('#createUserForm input[name="user_id"]').val('');
        // re-enable username and password inputs when clearing to switch back to create mode
        const $pwd = $('#createUserForm input[name=password]');
        $pwd.prop('disabled', false);
        $pwd.prop('type', 'password');
        $pwd.val('');
    // show the toggle button again for create mode
    $pwd.closest('.input-group').find('.password-toggle').show();
        $('#createUserForm input[name=username]').prop('disabled', false);
        $('#createUserForm #btn-create').text('Create');
    });

});