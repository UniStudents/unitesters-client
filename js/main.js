const loginButton = document.querySelector("#loginButton");
const BASE_URL = "https://unistudents-cb.herokuapp.com/api/student/";
const messages = document.querySelector(".messages");
const wrongCr = document.querySelector("#wrong-cr");
const systemDown = document.querySelector("#system-down");
const problem = document.querySelector("#problem");
const form = document.querySelector(".form-section");
const disclamer = document.querySelector(".form__disclaimer");
const infoCardBody = document.querySelector("#info > .card-body");
const gradesSection = document.querySelector(".student-grades");
const gradesContainer = document.querySelector(".grades-container");
const loader = document.querySelector(".loading-animation");
const coursesChart = document.getElementById("coursesChart").getContext("2d");
const gradesChart = document.getElementById("gradesChart").getContext("2d");
let student;

messages.style.display = "none";
wrongCr.style.display = "none";
systemDown.style.display = "none";
problem.style.display = "none";
loader.style.display = "none";
gradesSection.style.display = "none";

loginButton.addEventListener("click", (event) => {
  event.preventDefault();
  loginButton.style.display = "none";
  disclamer.style.display = "none";
  loader.style.display = "";
  const university = document.querySelector("#universities").value;
  const username = document.querySelector("#username").value;
  const password = document.querySelector("#password").value;
  const cookies = JSON.parse(localStorage.getItem("cookies"));
  fetch(`${BASE_URL}${university}`, {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
      cookies,
    }),
    headers: { "Content-type": "application/json; charset=UTF-8" },
  })
    .then((response) => {
      form.style.display = "none";
      loader.style.display = "none";
      if (response.status == 200) {
        form.style.display = "none";
        messages.style.display = "";
        return response.json();
      } else if (response.status == 401) {
        form.style.display = "none";
        messages.style.display = "";
        wrongCr.style.display = "";
      } else if (response.status == 408) {
        form.style.display = "none";
        messages.style.display = "";
        systemDown.style.display = "";
      } else if (response.status == 500) {
        form.style.display = "none";
        messages.style.display = "";
        problem.style.display = "";
      }
    })
    .then((data) => {
      if (data) {
        localStorage.setItem("cookies", JSON.stringify(data.cookies));
        console.log(data);
        student = data.student;
        const info = data.student.info;
        const grades = data.student.grades;
        /*
        infoCardBody.innerHTML = `
                <p><b>Α.Μ:</b> ${info.aem}</p>
                <p><b>Ονοματεπώνυμο:</b> ${info.lastName} ${info.firstName}</p>
                <p><b>Τμήμα:</b> ${info.department}</p>
                <p><b>Εξάμηνο:</b> ${info.semester}</p>
                <p><b>Πρόγραμμα Σπουδών:</b> ${info.registrationYear}</p>
                `;
        gradesCardBody.innerHTML = `
                <p><b>Μ.Ο (Σύνολο):</b> ${grades.totalAverageGrade}</p>
                <p><b>Περασμένα (Σύνολο):</b> ${grades.totalPassedCourses}</p>
                <p><b>ECTS (Σύνολο):</b> ${grades.totalEcts}</p>
                `;
        */
        for (let i = 0; i < grades.semesters.length; i++) {
          let html = "";
          const semester = grades.semesters[i];
          html += `
                <h3 class="semester">Εξάμηνο ${semester.id}</h3>
                <ul class="courses">
            `;
          for (let j = 0; j < semester.courses.length; j++) {
            const course = semester.courses[j];
            html += `
                <li class="course">
                    <div class="course-info">
                    <p class="course-info__code">${course.id}</p>
                    <p class="course-info__name">
                    ${course.name}
                    </p>
                    <p class="course-info__type">${
                      course.type === "" || course.examPeriod === "-"
                        ? "-"
                        : `${course.type} | ${course.examPeriod}`
                    }</p>
                    </div>
                    <p class="course-grade">${course.grade}</p>
                </li>
                `;
          }
          html += `
                </ul>
            `;
          gradesContainer.innerHTML += html;
          gradesSection.style.display = "";
        }
      }
    });
});
