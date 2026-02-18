const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const status = document.getElementById("status");
const startBtn = document.getElementById("startBtn");

// Telegram user
const user = tg.initDataUnsafe?.user;

if (user) {
  status.textContent = `Hello, ${user.first_name}`;
} else {
  status.textContent = "Opened outside Telegram";
}

startBtn.addEventListener("click", () => {
  status.textContent = "Day 1 started 🚀";
  tg.HapticFeedback.impactOccurred("medium");
});init