document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const status = document.getElementById("status");
  const done = document.getElementById("done");

  let startDate = localStorage.getItem("startDate");

  if (startDate) {
    const days =
      Math.floor(
        (Date.now() - Number(startDate)) / (1000 * 60 * 60 * 24)
      ) + 1;

    status.textContent = `Day ${days} started 🚀`;
    startBtn.style.display = "none";
    done.style.display = "block";
  }

  startBtn.addEventListener("click", () => {
    if (!localStorage.getItem("startDate")) {
      localStorage.setItem("startDate", Date.now());
    }

    status.textContent = "Day 1 started 🚀";
    startBtn.style.display = "none";
    done.style.display = "block";
  });
});