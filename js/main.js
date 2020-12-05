const loginButton = document.querySelector('#loginButton');
const BASE_URL = 'https://unistudents-cb.herokuapp.com/api/student/'
const messages = document.querySelector('.messages');
const wrongCr = document.querySelector('#wrong-cr');
const systemDown = document.querySelector('#system-down');
const problem = document.querySelector('#problem');
const form = document.querySelector('form');
const cards = document.querySelector('.cards');
const infoCardBody = document.querySelector('#info > .card-body');
const gradesCardBody = document.querySelector('#grades > .card-body');

messages.style.display = 'none';
wrongCr.style.display = 'none';
systemDown.style.display = 'none';
problem.style.display = 'none';
cards.style.display = 'none';


loginButton.addEventListener('click', (event) => {
    event.preventDefault();
    const university = document.querySelector('#universities').value;
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;
    const cookies = JSON.parse(localStorage.getItem("cookies"));
    
    fetch(`${BASE_URL}${university}`, {
        method: "POST",
        body: JSON.stringify({
            username,
            password,
            cookies
        }),
        headers: { "Content-type": "application/json; charset=UTF-8" }
    })
        .then(response => {
            if (response.status == 200) {
                form.style.display = 'none';
                messages.style.display = '';
                cards.style.display = '';
                return response.json();
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
        })
        .then(data => {
            if (data) {
                localStorage.setItem("cookies", JSON.stringify(data.cookies));
                const info = data.student.info;
                const grades = data.student.grades;
    
                infoCardBody.innerHTML = `
                <p><b>Α.Μ:</b> ${info.aem}</p>
                <p><b>Ονοματεπώνυμο:</b> ${info.lastName} ${info.firstName}</p>
                <p><b>Τμήμα:</b> ${info.department}</p>
                <p><b>Εξάμηνο:</b> ${info.semester}</p>
                <p><b>Πρόγραμμα Σπουδών:</b> ${info.registrationYear}</p>
                `
    
                gradesCardBody.innerHTML = `
                <p><b>Μ.Ο (Σύνολο):</b> ${grades.totalAverageGrade}</p>
                <p><b>Περασμένα (Σύνολο):</b> ${grades.totalPassedCourses}</p>
                <p><b>ECTS (Σύνολο):</b> ${grades.totalEcts}</p>
                `
    
                for (let i = 0; i < grades.semesters.length; i++) {
                    const semester = grades.semesters[i];
    
                    gradesCardBody.innerHTML += `
                    <hr>
                    <p><b>ΕΞΑΜΗΝΟ </b> ${semester.id}</p>
                    <p><b>Μ.Ο:</b> ${semester.gradeAverage}</p>
                    <p><b>Περασμένα:</b> ${semester.passedCourses}</p>
                    <p><b>ECTS:</b> ${semester.ects}</p>
                    <p><i>Λίστα Μαθημάτων</i></p>
                    `
    
                    for (let j = 0; j < semester.courses.length; j++) {
                        const course = semester.courses[j];
                        gradesCardBody.innerHTML += `
                        <small><b>ID: </b>${course.id}</small>
                        <small><b>Είδος: </b>${course.type}</small>
                        <small><b>Περίοδος: </b>${course.examPeriod}</small>
                        <p><b>${course.name}:</b> ${course.grade}</p>
                        `
                    }
                }
            }
    
        })
})