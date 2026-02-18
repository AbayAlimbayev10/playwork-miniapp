cconst startBtn = document.getElementById("startBtn");
const status = document.getElementById("status");
const dayBlock = document.getElementById("dayBlock"); // блок задания

startBtn.addEventListener("click", () => {
  status.textContent = "Day 1 started 🚀";
  dayBlock.classList.remove("hidden");
});onst tg = window.Telegram.WebApp;
tg.ready();

const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");

let dayStarted = localStorage.getItem("day1_started") === "true";

function render() {
  if (dayStarted) {
    statusEl.innerText = "Day 1 started 🚀";
    startBtn.style.display = "none";
  } else {
    statusEl.innerText = "Ready to start";
    startBtn.style.display = "block";
  }
}

startBtn.addEventListener("click", () => {
  dayStarted = true;
  localStorage.setItem("day1_started", "true");
  render();
});

render();
const doneBtn = document.getElementById("doneBtn");

doneBtn.addEventListener("click", () => {
  // текущий день храним в localStorage
  let day = Number(localStorage.getItem("day")) || 1;

  day = day + 1;
  if (day > 30) day = 30;

  localStorage.setItem("day", String(day));

  document.getElementById("status").textContent = `Day ${day} started 🚀`;
});
const startBtn = document.getElementById("startBtn");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");

// 1) при загрузке
statusEl.textContent = "Ready";

// 2) читаем сохранённый день (если есть)
let day = Number(localStorage.getItem("day") || 0);

if (day > 0) {
  statusEl.textContent = `Day ${day} started 🚀`;
  resultEl.textContent = "Done ✅";
}

// 3) по кнопке Start
startBtn.addEventListener("click", () => {
  if (day === 0) day = 1;      // стартуем Day 1
  localStorage.setItem("day", String(day));

  statusEl.textContent = `Day ${day} started 🚀`;
  resultEl.textContent = "Done ✅";
});
const startBtn = document.getElementById("startBtn");
const doneBtn = document.getElementById("doneBtn");
const statusText = document.getElementById("status");
const title = document.getElementById("title");

// загружаем день
let day = localStorage.getItem("day");

if (!day) {
  statusText.innerText = "Ready to start";
} else {
  title.innerText = `Day ${day}`;
  statusText.innerText = "Continue";
}

// Start
startBtn.onclick = () => {
  day = day ? parseInt(day) : 1;
  title.innerText = `Day ${day} started 🚀`;
  statusText.innerText = "Do today's task";
  startBtn.style.display = "none";
  doneBtn.style.display = "inline-block";
};

// Done
doneBtn.onclick = () => {
  day = day ? parseInt(day) + 1 : 2;
  localStorage.setItem("day", day);
  title.innerText = `Day ${day}`;
  statusText.innerText = "Ready for next day";
  startBtn.style.display = "inline-block";
  doneBtn.style.display = "none";
};