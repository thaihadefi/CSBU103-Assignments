$(document).ready(function () {
    $('#createUserForm #btn-create').click(function (event) {

        const formData = {
            username: $('#createUserForm input[name=username]').val(),
            name: $('#createUserForm input[name=name]').val(),
            gender: $('#createUserForm input[name=gender]').val()
        }
        const userId = $('#createUserForm input[name="user_id"]').val()
        console.log(formData)
        if (!userId) {
            $.ajax({
                method: "POST",
                url: "http://localhost:3000/users",
                data: JSON.stringify(formData),
                contentType: 'application/json',
                encode: true,
            }).done(function (resp) {
                const { status, data } = resp
                console.log(resp)
                if (status && data) {
                    // resp.forEach(function(val) {
                    $('#userList tbody').append(
                        `<tr class="user-id" data-userid="${data.id}"><td scope="row">${data.id}</td><td class="username">${data.username}</td><td class="name">${data.name}</td><td class="gender">${data.gender}</td><td><button class="del-btn btn btn-danger" data-id="${data.id}">Delete</button><button class="update-btn btn btn-warning" data-id="${data.id}">Update</button></td></tr>`
                    )
                    $(`button.del-btn[data-id="${data.id}"]`).click(function (e) {
                        const userId = $(this).attr('data-id')
                        console.log(userId)
                        $.ajax({
                            method: "DELETE",
                            url: `http://localhost:3000/users/${userId}`,
                            contentType: 'application/json',
                            encode: true,
                        }).done(function (resp) {
                            const { status } = resp
                            if (status) {
                                $(`tr[data-userid="${userId}"]`).empty();
                            }
                        })
                    })
                    $(`button.update-btn[data-id="${data.id}"]`).click(function (e) {
                        const userId = $(this).attr('data-id')
                        $('#createUserForm input[name="user_id"]').val(userId)
                        $('#createUserForm input[name=username]').val($(`tr[data-userid="${userId}"] td.username`).text())
                        $('#createUserForm input[name=name]').val($(`tr[data-userid="${userId}"] td.name`).text())
                        $(`#createUserForm input[id="${$(`tr[data-userid="${userId}"] td.gender`).text()}"]`).attr('checked', 'true')

                        $('#createUserForm #btn-create').text('Update')

                    })

                }
                // })
            });
        } else {
            $.ajax({
                method: "PUT",
                url: `http://localhost:3000/users/${userId}`,
                data: JSON.stringify(formData),
                contentType: 'application/json',
                encode: true,
            }).done(function (resp) {
                const { status, data } = resp
                console.log(resp)
                if (status && data) {
                    $(`tr[data-userid="${userId}"]`).empty();

                    // resp.forEach(function(val) {
                    $('#userList tbody').append(
                        `<tr class="user-id" data-userid="${userId}"><td scope="row">${userId}</td><td class="username">${data.username}</td><td class="name">${data.name}</td><td class="gender">${data.gender}</td></span><td><button class="del-btn btn btn-danger" data-id="${data.id}">Delete</button><button class="update-btn btn btn-warning" data-id="${data.id}">Update</button></td></tr>`
                    )
                    $(`button.del-btn[data-id="${data.id}"]`).click(function (e) {
                        const updatedUserId = $(this).attr('data-id')
                        $.ajax({
                            method: "DELETE",
                            url: `http://localhost:3000/users/${userId}`,
                            contentType: 'application/json',
                            encode: true,
                        }).done(function (resp) {
                            const { status } = resp
                            if (status) {
                                $(`tr[data-userid="${userId}"]`).empty();
                            }
                        })
                    })
                    $('button.update-btn[data-id="${data.id}"]').click(function (e) {
                        const userId = $(this).attr('data-id')
                        console.log($(`tr[data-userid="${userId}"] td.username`).text())
                        $('#createUserForm input[name="user_id"]').val(userId)
                        $('#createUserForm input[name=username]').val($(`tr[data-userid="${userId}"] td.username`).text())
                        $('#createUserForm input[name=name]').val($(`tr[data-userid="${userId}"] td.name`).text())
                        $(`#createUserForm input[id="${$(`tr[data-userid="${userId}"] td.gender`).text()}"]`).attr('checked', 'true')
                        $('#createUserForm #btn-create').val('Update')

                    })

                }
                // })
            });
        }


        event.preventDefault();
    })
    // Get all
    /*
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/users",
        contentType: 'application/json',
        encode: true,
    }).done(function (data) {
        console.log(data)
        data.forEach(function (val) {
            $('#userList tbody').append(
                `<tr class="user-id" data-userid="${val.id}"><td scope="row">${val.id}</td><td class="username">${val.username}</td><td class="name">${val.name}</td><td class="gender">${val.gender}</td><td><button class="del-btn btn btn-danger" data-id="${val.id}">Delete</button><button class="update-btn btn btn-warning" data-id="${val.id}">Update</button></td></tr>`
            )
        })
        $('.del-btn').click(function (e) {
            const userId = $(this).attr('data-id')
            console.log(userId)
            $.ajax({
                method: "DELETE",
                url: `http://localhost:3000/users/${userId}`,
                contentType: 'application/json',
                encode: true,
            }).done(function (resp) {
                const { status } = resp
                if (status) {
                    $(`tr[data-userid="${userId}"]`).empty();
                }
            })
        })
        $('.update-btn').click(function (e) {
            const userId = $(this).attr('data-id')
            $('#createUserForm input[name="user_id"]').val(userId)
            $('#createUserForm input[name="user_id"]').val(userId)
            $('#createUserForm input[name=username]').val($(`tr[data-userid="${userId}"] td.username`).text())
            $('#createUserForm input[name=name]').val($(`tr[data-userid="${userId}"] td.name`).text())
            $(`#createUserForm input[id="${$(`tr[data-userid="${userId}"] td.gender`).text()}"]`).attr('checked', 'true')
            $('#createUserForm #btn-create').text('Update')
        })
    });
    $('#createUserForm input[name=user_id]').change(function (e) {
        if ($('#createUserForm #btn-create').text()) {
            $('#createUserForm #btn-create').text('Update')
        } else {
            $('#createUserForm #btn-create').text('Create')

        }
    })
    */
    $('.del-btn').click(function (e) {
        const userId = $(this).attr('data-id')
        console.log(userId)
        $.ajax({
            method: "DELETE",
            url: `http://localhost:3000/users/${userId}`,
            contentType: 'application/json',
            encode: true,
        }).done(function (resp) {
            const { status } = resp
            if (status) {
                $(`tr[data-userid="${userId}"]`).empty();
            }
        })
    })
    $('.update-btn').click(function (e) {
        const userId = $(this).attr('data-id')
        $('#createUserForm input[name="user_id"]').val(userId)
        $('#createUserForm input[name="user_id"]').val(userId)
        $('#createUserForm input[name=username]').val($(`tr[data-userid="${userId}"] td.username`).text())
        $('#createUserForm input[name=name]').val($(`tr[data-userid="${userId}"] td.name`).text())
        $(`#createUserForm input[id="${$(`tr[data-userid="${userId}"] td.gender`).text()}"]`).attr('checked', 'true')
        $('#createUserForm #btn-create').text('Update')
    })
    $('#createUserForm button.btn-warning').on('click', function (e) {
        $('#createUserForm input[name="user_id"]').val('')
        $('#createUserForm input[name=username]').val('')
        $('#createUserForm input[name=name]').val('')
        $('#createUserForm #btn-create').text('Create')
    })

})