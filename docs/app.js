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