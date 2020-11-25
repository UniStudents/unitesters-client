const loginButton = document.querySelector('#loginButton');
const BASE_URL = 'https://unistudents-cb.herokuapp.com/api/student/'
const messages = document.querySelector('.messages');
const success = document.querySelector('#success');
const wrongCr = document.querySelector('#wrong-cr');
const systemDown = document.querySelector('#system-down');
const problem = document.querySelector('#problem');
const form = document.querySelector('form');

messages.style.display = 'none';
success.style.display = 'none';
wrongCr.style.display = 'none';
systemDown.style.display = 'none';
problem.style.display = 'none';

loginButton.addEventListener('click', (event) => {
    event.preventDefault();
    const university = document.querySelector('#universities').value;
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;

    fetch(`${BASE_URL}${university}`, {
        method: "POST",
        body: JSON.stringify({
            username,
            password
        }),
        headers: { "Content-type": "application/json; charset=UTF-8" }
    })
        .then(response => {
            if (response.status == 200) {
                form.style.display = 'none';
                messages.style.display = '';
                success.style.display = '';
            } else if (response.status == 401) {
                form.style.display = 'none';
                messages.style.display = '';
                wrongCr.style.display = '';
            } else if (response.status == 408) {
                form.style.display = 'none';
                messages.style.display = '';
                systemDown.style.display = '';
            } else if (response.status == 500) {
                form.style.display = 'none';
                messages.style.display = '';
                problem.style.display = '';
            }
        });
})