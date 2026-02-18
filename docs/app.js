const startBtn = document.getElementById("startBtn");
const statusEl = document.getElementById("status");
const doneEl = document.getElementById("done");

function setStateStarted() {
  statusEl.textContent = "Day 1 started 🚀";
  startBtn.style.display = "none";
  doneEl.style.display = "block";
}

startBtn.addEventListener("click", () => {
  setStateStarted();
});

// просто чтобы “Loading...” не висело бесконечно
statusEl.textContent = "Ready";