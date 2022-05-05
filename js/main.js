const loginButton = document.querySelector("#loginButton");
const BASE_URL = "https://unistudents-cb.herokuapp.com/api/student/";
const form = document.querySelector(".form-section");
const btnText = document.querySelector(".btn--text");
const loader = document.querySelector(".loading-animation");
const disclamer = document.querySelector(".form__disclaimer");
const emptyMessage = document.querySelector(".form__empty");
const infoCardBody = document.querySelector("#info > .card-body");
const profileSection = document.querySelector(".student-profile");
const gradesSection = document.querySelector(".student-grades");
const studentWelcome = document.querySelector(".student-heading");
const studentScores = document.querySelector(".student-scores");
const gradesContainer = document.querySelector(".grades-container");
const doughnutChart = document.getElementById("doughnutChart").getContext("2d");
const lineChart = document.getElementById("lineChart").getContext("2d");
const tabsContainer = document.querySelector(".tabs-container");
const tabHome = document.querySelector("#tab-home");
const tabGrades = document.querySelector("#tab-grades");
const error408 = document.querySelector("#error-408");
const error500 = document.querySelector("#error-500");
let student;

tabHome.addEventListener("click", function () {
  tabHome.classList.add("tab--active");
  tabGrades.classList.remove("tab--active");
  profileSection.classList.remove("hidden");
  gradesSection.classList.add("hidden");
});
tabGrades.addEventListener("click", function () {
  tabHome.classList.remove("tab--active");
  tabGrades.classList.add("tab--active");
  profileSection.classList.add("hidden");
  gradesSection.classList.remove("hidden");
});

loginButton.addEventListener("click", (event) => {
  event.preventDefault();
  disclamer.classList.add("hidden");
  const university = document.querySelector("#universities").value;
  const username = document.querySelector("#username").value;
  const password = document.querySelector("#password").value;
  emptyMessage.classList.add("hidden");
  if (university === "" || username === "" || password === "") {
    emptyMessage.classList.remove("hidden");
    return;
  }
  btnText.classList.add("hidden");
  loader.classList.remove("hidden");
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
      loader.classList.add("hidden");
      btnText.classList.remove("hidden");
      const pass = document.querySelector("#password");
      pass.classList.remove("form-group__input--error");
      if (response.status == 200) {
        form.classList.add("hidden");
        return response.json();
      } else if (response.status == 401) {
        pass.value = "";
        pass.classList.add("form-group__input--error");
        document.querySelector("label[for=password]").style.color = "#f03e3e";
        document
          .querySelector("#username")
          .classList.add("form-group__input--error");
        document.querySelector("label[for=username]").style.color = "#f03e3e";
      } else if (response.status == 408) {
        error408.classList.remove("hidden");
      } else if (response.status == 500) {
        error500.classList.remove("hidden");
      }
    })
    .then((data) => {
      if (data) {
        localStorage.setItem("cookies", JSON.stringify(data.cookies));
        student = data.student;
        getStudentProfile();
        getLineChart();
        window.scrollTo({ top: 0, behavior: "smooth" });
        profileSection.classList.add("ready");
        document.querySelector(".student-grades").classList.add("ready");
      }
    });
});

function getStudentGrades() {
  const grades = student.grades;
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
                  <p class="course-grade ${
                    course.grade < 5 && course.grade >= 0 ? "red" : ""
                  }">${course.grade}</p>
              </li>
            `;
    }
    html += `
            </ul>
        `;
    gradesContainer.innerHTML += html;
  }
}

function getStudentProfile() {
  const info = student.info;
  const grades = student.grades;
  studentWelcome.innerHTML += `
        <span class="student-heading__message">Συνδέθηκες ως</span>
        <span class="student-heading__name">${info.firstName} ${info.lastName}</span>
    `;
  studentScores.innerHTML += `
        <div class="student-scores">
            <div class="student-score">
            <p class="student-score__number">${grades.totalPassedCourses}</p>
            <p class="student-score__description">Περασμένα Μαθήματα</p>
            </div>
            <div class="student-score">
            <p class="student-score__number">${grades.totalAverageGrade}</p>
            <p class="student-score__description">Μέσος Όρος</p>
            </div>
            <div class="student-score">
            <p class="student-score__number">${grades.totalEcts}</p>
            <p class="student-score__description">ECTS</p>
            </div>
        </div>
    `;
  getDoughnutChart();
  getStudentGrades();
  profileSection.classList.remove("hidden");
  tabsContainer.classList.remove("hidden");
}

function getDoughnutChart() {
  const dataset = [0, 0, 0];
  dataset[0] = Number(student.grades.totalPassedCourses);

  for (const semester of student.grades.semesters) {
    for (const course of semester.courses) {
      if (course.grade === "") {
        continue;
      }
      if (course.grade === "-") {
        dataset[2]++;
      } else if (Number(course.grade) < 5) {
        dataset[1]++;
      }
    }
  }

  return new Chart(doughnutChart, {
    type: "doughnut",
    data: {
      labels: ["Πέρασες", "Κόπηκες", "Δεν έχεις δώσει"],
      datasets: [
        {
          backgroundColor: [
            "#657BFF",
            "rgba(101,123,255,0.6)",
            "rgba(101,123,255,0.3)",
          ],
          data: dataset,
          borderWidth: 0,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          onClick: null,
        },
      },
    },
  });
}

function getLineChart() {
  const grades = [];
  const semesters = [];

  for (let i = 0; i < student.grades.semesters.length; i++) {
    if (student.grades.semesters[i].gradeAverage === "-") {
      continue;
    }
    semesters.push(student.grades.semesters[i].id);
    grades.push(
      Number(
        student.grades.semesters[i].gradeAverage
          .replace("-", "")
          .replace(",", ".")
      )
    );
  }

  return new Chart(lineChart, {
    type: "line",
    data: {
      labels: semesters,
      datasets: [
        {
          label: "Μέσος Όρος / Εξάμηνο",
          fill: true,
          lineTension: 0.4,
          backgroundColor: "rgba(101,123,255,0.41)",
          borderColor: "#657BFF",
          borderCapStyle: "butt",
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: "miter",
          pointBorderColor: "rgba(75,192,192,1)",
          pointBackgroundColor: "#fff",
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgba(75,192,192,1)",
          pointHoverBorderColor: "rgba(220,220,220,1)",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: grades,
          spanGaps: false,
          duration: 4000,
          easing: "easeInQuart",
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          onClick: null,
          labels: {
            boxWidth: 0,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: true,
          },
        },
        y: {
          grid: {
            drawBorder: false,
            display: false,
          },
          ticks: {
            maxTicksLimit: 4,
          },
        },
      },
    },
  });
}

function updateDoughnutChart() {
  const dataset = [0, 0, 0];
  dataset[0] = Number(student.grades.totalPassedCourses);

  for (const semester of student.grades.semesters) {
    for (const course of semester.courses) {
      if (course.grade === "") {
        continue;
      }
      if (course.grade === "-") {
        dataset[2]++;
      } else if (Number(course.grade) < 5) {
        dataset[1]++;
      }
    }
  }

  doughnutChart.data.datasets[0].data = dataset;
  doughnutChart.update();
}

function updateLineChart() {
  const grades = [];
  const semesters = [];

  for (let i = 0; i < student.grades.semesters.length; i++) {
    if (student.grades.semesters[i].gradeAverage === "-") {
      continue;
    }
    semesters.push(student.grades.semesters[i].id);
    grades.push(
      Number(
        student.grades.semesters[i].gradeAverage
          .replace("-", "")
          .replace(",", ".")
      )
    );
  }

  lineChart.data.datasets[0].data = grades;
  lineChart.data.labels = semesters;

  lineChart.update();
}
