// PlayWork Mini App — MVP
const tg = window.Telegram?.WebApp;
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const screenEl = document.getElementById("screen");

const STORAGE_KEY = "playwork_state_v1";

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { started: false, day: 0 };
  } catch {
    return { started: false, day: 0 };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setStatus(text) {
  statusEl.textContent = text;
}

function renderWelcome(userName, state) {
  screenEl.innerHTML = `
    <div class="block">
      <div class="label">Сегодня</div>
      <div class="big">Запускаем 14-дневный режим</div>
      <div class="muted">Нажми Start — начнём с Day 1.</div>
    </div>
  `;
  startBtn.style.display = "block";
  startBtn.textContent = state.started ? `Continue (Day ${state.day})` : "Start";
  setStatus(userName ? `Hello, ${userName}` : "Opened outside Telegram");
}

function renderDay1() {
  screenEl.innerHTML = `
    <div class="block">
      <div class="label">Day 1</div>
      <div class="big">Focus Reset</div>
      <ul class="list">
        <li>✅ 10 минут прогулки</li>
        <li>✅ 2 стакана воды</li>
        <li>✅ 1 задача: “самое важное сегодня”</li>
      </ul>
      <button id="doneBtn" class="btn secondary">Done</button>
    </div>
  `;

  const doneBtn = document.getElementById("doneBtn");
  doneBtn.addEventListener("click", () => {
    const state = loadState();
    state.day = 2;
    saveState(state);
    if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred("success");
    setStatus("Day 1 completed ✅");
    renderWelcome(getUserName(), state);
  });

  setStatus("Day 1 started 🚀");
  startBtn.style.display = "none";
}

function getUserName() {
  const user = tg?.initDataUnsafe?.user;
  return user?.first_name || "";
}

function initTelegram() {
  if (!tg) return;
  tg.ready();
  tg.expand();
  // Опционально: цвет/кнопка "назад" позже
}

function main() {
  initTelegram();

  const state = loadState();
  const name = getUserName();

  if (state.started && state.day === 1) {
    renderDay1();
  } else {
    renderWelcome(name, state);
  }

  startBtn.addEventListener("click", () => {
    const state = loadState();
    state.started = true;
    if (!state.day || state.day < 1) state.day = 1;
    saveState(state);

    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred("medium");
    renderDay1();
  });
}

main();