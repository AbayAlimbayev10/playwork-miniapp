const tg = window.Telegram.WebApp;
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