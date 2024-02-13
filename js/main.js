const loginButton = document.querySelector("#loginButton");
const BASE_URL = "https://scrape-farm-1.unistudents.gr/api/student/";
const BASE_URL_ELEARNING = "https://scrape-farm-1.unistudents.gr/api/elearning/";
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
let courses;

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
  const platform = document.querySelector("#platform").value;
  emptyMessage.classList.add("hidden");
  if (university === "" || username === "" || password === "") {
    emptyMessage.classList.remove("hidden");
    return;
  }
  btnText.classList.add("hidden");
  loader.classList.remove("hidden");
  if (platform === "student") {
    getStudentData(university, username, password);
  } else if (platform === "elearning") {
    getElearningData(university, username, password);
  }
});

function getElearningData(university, username, password) {
  const cookies = JSON.parse(localStorage.getItem("cookies"));
  fetch(`${BASE_URL_ELEARNING}${university}`,  {
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
      if (response.status === 200) {
        form.classList.add("hidden");
        return response.json();
      } else if (response.status === 401) {
        pass.value = "";
        pass.classList.add("form-group__input--error");
        document.querySelector("label[for=password]").style.color = "#f03e3e";
        document
            .querySelector("#username")
            .classList.add("form-group__input--error");
        document.querySelector("label[for=username]").style.color = "#f03e3e";
      } else if (response.status === 408) {
        error408.classList.remove("hidden");
      } else if (response.status === 500) {
        error500.classList.remove("hidden");
      }
    })
    .then((data) => {
      if (data) {
        localStorage.setItem("cookies", JSON.stringify(data.cookies));
        courses = data.courses;
        console.log(courses);
        // renderStudentProfile();
        // renderStudentGrades();
        tabsContainer.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
        profileSection.classList.add("ready");
        // document.querySelector(".student-grades").classList.add("ready");
      }
    });
}

function getStudentData(university, username, password) {
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
      if (response.status === 200) {
        form.classList.add("hidden");
        return response.json();
      } else if (response.status === 401) {
        pass.value = "";
        pass.classList.add("form-group__input--error");
        document.querySelector("label[for=password]").style.color = "#f03e3e";
        document
          .querySelector("#username")
          .classList.add("form-group__input--error");
        document.querySelector("label[for=username]").style.color = "#f03e3e";
      } else if (response.status === 408) {
        error408.classList.remove("hidden");
      } else if (response.status === 500) {
        error500.classList.remove("hidden");
      }
    })
    .then((data) => {
      if (data) {
        console.log(data);
        localStorage.setItem("cookies", JSON.stringify(data.cookies));
        student = data.student;
        renderStudentProfile();
        renderStudentGrades();
        tabsContainer.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
        profileSection.classList.add("ready");
        document.querySelector(".student-grades").classList.add("ready");
      }
    });
}

function renderStudentProfile() {
  const info = student.info;
  const progress = student.progress;
  studentWelcome.innerHTML += `
        <span class="student-heading__message">Συνδέθηκες ως</span>
        <span class="student-heading__name">${info.firstName} ${info.lastName}</span>
    `;
  studentScores.innerHTML += `
        <div class="student-scores">
            <div class="student-score">
            <p class="student-score__number">${progress.passedCourses}</p>
            <p class="student-score__description">Περασμένα Μαθήματα</p>
            </div>
            <div class="student-score">
            <p class="student-score__number">${progress.averageGrade}</p>
            <p class="student-score__description">Μέσος Όρος</p>
            </div>
            <div class="student-score">
            <p class="student-score__number">${progress.ects}</p>
            <p class="student-score__description">ECTS</p>
            </div>
        </div>
    `;
  getLineChart();
  getDoughnutChart();
  profileSection.classList.remove("hidden");
}

function renderStudentGrades() {
  const progress = student.progress;
  for (let i = 0; i < progress.semesters.length; i++) {
    let html = "";
    const semester = progress.semesters[i];
    html += `
            <h3 class="semester">Εξάμηνο ${semester.id}</h3>
            <ul class="courses">
        `;
    for (let j = 0; j < semester.courses.length; j++) {
      const course = semester.courses[j];

      let courseColor = '';
      let courseGrade = '-';
      if (course.latestExamGrade) {
        courseColor = !course.latestExamGrade.isPassed ? 'red' : '';
        courseGrade = course.latestExamGrade.grade;
      }

      html += `
              <li class="course">
                  <div class="course-info">
                  <p class="course-info__code">${course.id}</p>
                  <p class="course-info__name">
                  ${course.name}
                  </p>
                  <p class="course-info__type">${
                    course.type === "" || !course.latestExamGrade
                      ? "-"
                      : `${course.type} | ${course.latestExamGrade.displayPeriod}`
                  }</p>
                  </div>
                  <p class="course-grade ${courseColor}">${courseGrade}</p>
              </li>
            `;
    }
    html += `
            </ul>
        `;
    gradesContainer.innerHTML += html;
  }
}

function getDoughnutChart() {
  const dataset = [0, 0, 0];
  dataset[0] = Number(student.progress.passedCourses);

  for (const semester of student.progress.semesters) {
    for (const course of semester.courses) {
      if (!course.latestExamGrade) {
        dataset[2]++;
      } else if (Number(course.latestExamGrade.grade) < 5) {
        dataset[1]++;
      }
    }
  }

  return new Chart(doughnutChart, {
    type: "doughnut",
    data: {
      labels: ["Περασμένα", "Κομμένα", "Χωρίς Βαθμό"],
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

  for (let i = 0; i < student.progress.semesters.length; i++) {
    if (student.progress.semesters[i].averageGrade === "-") {
      continue;
    }
    semesters.push(student.progress.semesters[i].id);
    grades.push(
      Number(
        student.progress.semesters[i].averageGrade
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
  dataset[0] = Number(student.progress.passedCourses);

  for (const semester of student.progress.semesters) {
    for (const course of semester.courses) {
      if (course.latestExamGrade.grade === "") {
        continue;
      }
      if (course.latestExamGrade.grade === "-") {
        dataset[2]++;
      } else if (Number(course.latestExamGrade.grade) < 5) {
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

  for (let i = 0; i < student.progress.semesters.length; i++) {
    if (student.progress.semesters[i].averageGrade === "-") {
      continue;
    }
    semesters.push(student.progress.semesters[i].id);
    grades.push(
      Number(
        student.progress.semesters[i].averageGrade
          .replace("-", "")
          .replace(",", ".")
      )
    );
  }

  lineChart.data.datasets[0].data = grades;
  lineChart.data.labels = semesters;
  lineChart.update();
}
