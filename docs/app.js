document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const statusEl = document.getElementById("status");

  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  let startDate = localStorage.getItem("startDate");

  // Если старт уже был — считаем день
  if (startDate) {
    startDate = new Date(startDate);
    const today = new Date();
    const diffDays = Math.floor((today - startDate) / MS_PER_DAY) + 1;

    statusEl.textContent = `Day ${diffDays} started 🚀`;
    startBtn.style.display = "none";
    return;
  }

  // Если старта не было — ждём кнопку
  statusEl.textContent = "Ready to start";
  startBtn.style.display = "inline-block";

  startBtn.addEventListener("click", () => {
    const now = new Date();
    localStorage.setItem("startDate", now.toISOString());

    statusEl.textContent = "Day 1 started 🚀";
    startBtn.style.display = "none";
  });
});