// PlayWork Mini App — 30-day challenge (offline/localStorage)
// Works in Telegram WebApp + normal browser.

const TOTAL_DAYS = 30;
const STORAGE_KEY = "playwork_state_v1";

const tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;

// --- UI elements
const subtitle = document.getElementById("subtitle");
const dayPill = document.getElementById("dayPill");
const statusPill = document.getElementById("statusPill");
const dayDesc = document.getElementById("dayDesc");

const tasksList = document.getElementById("tasksList");

const progressText = document.getElementById("progressText");
const streakText = document.getElementById("streakText");
const barFill = document.getElementById("barFill");

const startDayBtn = document.getElementById("startDayBtn");
const finishDayBtn = document.getElementById("finishDayBtn");
const nextDayBtn = document.getElementById("nextDayBtn");
const resetBtn = document.getElementById("resetBtn");

// --- Program data (пример). Ты можешь потом заменить на свои задания.
const PROGRAM = buildProgram30();

function buildProgram30() {
  // Простая структура: Day N => { title, tasks[] }
  // Потом заменим на твою “настоящую” программу.
  const days = {};
  for (let d = 1; d <= TOTAL_DAYS; d++) {
    days[d] = {
      title: `Day ${d}`,
      tasks: [
        `План на день (1 главная цель)`,
        `Фокус-блок 25 минут без отвлечений`,
        `10 минут ходьбы / растяжки`,
        `Сон: лечь на 30 минут раньше`,
      ],
    };
  }
  return days;
}

// --- State
let state = loadState();

function defaultState() {
  return {
    currentDay: 1,
    startedDays: {},     // { "1": true }
    completedDays: {},   // { "1": true }
    checks: {},          // { "1": [true,false,...] }
    streak: 0,
    lastCompletedDay: 0,
    createdAt: Date.now(),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    // minimal validation
    if (!parsed || typeof parsed !== "object") return defaultState();
    if (!parsed.currentDay) parsed.currentDay = 1;
    if (!parsed.startedDays) parsed.startedDays = {};
    if (!parsed.completedDays) parsed.completedDays = {};
    if (!parsed.checks) parsed.checks = {};
    if (typeof parsed.streak !== "number") parsed.streak = 0;
    if (typeof parsed.lastCompletedDay !== "number") parsed.lastCompletedDay = 0;
    return parsed;
  } catch {
    return defaultState();
  }
}

function saveState(s) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

// --- Telegram init
function initTelegram() {
  if (!tg) {
    subtitle.textContent = "Web mode (not Telegram)";
    return;
  }
  tg.ready();
  tg.expand();
  subtitle.textContent = "Telegram Mini App";
}
initTelegram();

// --- Helpers
function getDayData(day) {
  return PROGRAM[day] || { title: `Day ${day}`, tasks: ["Task 1", "Task 2"] };
}

function ensureChecks(day) {
  const key = String(day);
  const tasksCount = getDayData(day).tasks.length;
  if (!Array.isArray(state.checks[key])) {
    state.checks[key] = new Array(tasksCount).fill(false);
    saveState(state);
    return;
  }
  // If tasks list changed length
  if (state.checks[key].length !== tasksCount) {
    const old = state.checks[key];
    const next = new Array(tasksCount).fill(false);
    for (let i = 0; i < Math.min(old.length, next.length); i++) next[i] = !!old[i];
    state.checks[key] = next;
    saveState(state);
  }
}

function haptic(type = "light") {
  if (!tg) return;
  if (tg.HapticFeedback && tg.HapticFeedback.impactOccurred) {
    tg.HapticFeedback.impactOccurred(type);
  }
}

// --- Render
function render() {
  const day = state.currentDay;
  const dayKey = String(day);
  const data = getDayData(day);

  ensureChecks(day);

  const checks = state.checks[dayKey];
  const total = checks.length;
  const doneCount = checks.filter(Boolean).length;
  const allChecked = total > 0 && doneCount === total;

  const dayStarted = !!state.startedDays[dayKey];
  const dayCompleted = !!state.completedDays[dayKey];

  dayPill.textContent = `Day ${day} / ${TOTAL_DAYS}`;

  // status
  if (dayCompleted) {
    statusPill.textContent = "Completed ✅";
    statusPill.style.borderColor = "#bbf7d0";
    statusPill.style.background = "#ecfdf5";
  } else if (dayStarted) {
    statusPill.textContent = "In progress 🚀";
    statusPill.style.borderColor = "#dbeafe";
    statusPill.style.background = "#eff6ff";
  } else {
    statusPill.textContent = "Not started";
    statusPill.style.borderColor = "";
    statusPill.style.background = "";
  }

  // main text
  if (dayCompleted) dayDesc.textContent = `Day ${day} completed ✅`;
  else if (dayStarted) dayDesc.textContent = `Day ${day} started 🚀`;
  else dayDesc.textContent = "Нажми Start чтобы начать день";

  // progress
  progressText.textContent = `${doneCount} / ${total}`;
  streakText.textContent = `Streak: ${state.streak}`;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  barFill.style.width = `${pct}%`;

  // tasks
  tasksList.innerHTML = "";
  data.tasks.forEach((t, idx) => {
    const row = document.createElement("label");
    row.className = "task";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!checks[idx];
    cb.disabled = !dayStarted || dayCompleted; // нельзя отмечать до Start и после Done

    cb.addEventListener("change", () => {
      state.checks[dayKey][idx] = cb.checked;
      saveState(state);
      haptic("light");
      render();
    });

    const textWrap = document.createElement("div");

    const title = document.createElement("div");
    title.className = "taskText";
    title.textContent = t;

    const small = document.createElement("div");
    small.className = "taskSmall";
    small.textContent = dayCompleted ? "Locked (completed)" : (!dayStarted ? "Locked (press Start)" : "Tap to mark");

    textWrap.appendChild(title);
    textWrap.appendChild(small);

    row.appendChild(cb);
    row.appendChild(textWrap);
    tasksList.appendChild(row);
  });

  // buttons logic
  startDayBtn.disabled = dayStarted || dayCompleted;
  finishDayBtn.disabled = !(dayStarted && allChecked && !dayCompleted);
  nextDayBtn.disabled = !(dayCompleted && day < TOTAL_DAYS);

  // Button labels
  startDayBtn.textContent = dayStarted ? "Started" : "Start";
  finishDayBtn.textContent = dayCompleted ? "Done ✅" : "Done ✅";
  nextDayBtn.textContent = day < TOTAL_DAYS ? "Next day →" : "Finish";
}

// --- Actions
startDayBtn.addEventListener("click", () => {
  const day = state.currentDay;
  const dayKey = String(day);
  state.startedDays[dayKey] = true;
  saveState(state);
  haptic("medium");
  render();
});

finishDayBtn.addEventListener("click", () => {
  const day = state.currentDay;
  const dayKey = String(day);

  state.completedDays[dayKey] = true;

  // streak logic: if completing day in sequence
  if (state.lastCompletedDay === day - 1) state.streak += 1;
  else if (state.lastCompletedDay !== day) state.streak = 1;

  state.lastCompletedDay = day;

  saveState(state);
  haptic("heavy");
  render();
});

nextDayBtn.addEventListener("click", () => {
  if (state.currentDay < TOTAL_DAYS) {
    state.currentDay += 1;
    saveState(state);
    haptic("medium");
    render();
  }
});

resetBtn.addEventListener("click", () => {
  const ok = confirm("Сбросить прогресс полностью?");
  if (!ok) return;
  state = defaultState();
  saveState(state);
  haptic("heavy");
  render();
});

// first render
render();
// ===== PlayWork: Button Logic (MVP) =====

// CONFIG
const MIN_DONE_TASKS = 3; // сколько задач нужно, чтобы нажать Done

// DOM (проверь, что id/class совпадают с твоим HTML)
const btnStart = document.querySelector("#btnStart");     // Started
const btnDone  = document.querySelector("#btnDone");      // Done ✅
const btnNext  = document.querySelector("#btnNext");      // Next day →
const taskCheckboxes = Array.from(document.querySelectorAll(".task-checkbox")); // чекбоксы задач

const dayLabel = document.querySelector("#dayLabel");     // "Day 1 / 30"
const progressLabel = document.querySelector("#progressLabel"); // "0/4"
const streakLabel = document.querySelector("#streakLabel"); // "Streak: 0"

// STATE (пока без сохранения — просто логика)
let state = {
  day: 1,
  totalDays: 30,
  status: "locked", // "locked" | "active" | "completed"
  completedCount: 0,
  streak: 0
};

// ===== Helpers =====
function setTasksEnabled(enabled) {
  taskCheckboxes.forEach(cb => {
    cb.disabled = !enabled;
    // если хочешь визуально "серить" карточки — добавим класс
    const card = cb.closest(".task-card");
    if (card) card.classList.toggle("disabled", !enabled);
  });
}

function updateCounts() {
  state.completedCount = taskCheckboxes.filter(cb => cb.checked).length;
}

function updateUI() {
  // labels
  if (dayLabel) dayLabel.textContent = `Day ${state.day} / ${state.totalDays}`;
  if (progressLabel) progressLabel.textContent = `${state.completedCount} / ${taskCheckboxes.length}`;
  if (streakLabel) streakLabel.textContent = `Streak: ${state.streak}`;

  // tasks enabled by status
  if (state.status === "locked") setTasksEnabled(false);
  if (state.status === "active") setTasksEnabled(true);
  if (state.status === "completed") setTasksEnabled(false);

  // buttons visibility / enabled
  if (btnStart) {
    btnStart.disabled = state.status !== "locked";
    btnStart.style.opacity = (state.status === "locked") ? "1" : "0.5";
  }

  if (btnDone) {
    const canDone = (state.status === "active" && state.completedCount >= MIN_DONE_TASKS);
    btnDone.disabled = !canDone;
    btnDone.style.opacity = canDone ? "1" : "0.5";
  }

  if (btnNext) {
    const canNext = (state.status === "completed");
    btnNext.disabled = !canNext;
    btnNext.style.opacity = canNext ? "1" : "0.5";
  }
}

// ===== Events =====
taskCheckboxes.forEach(cb => {
  cb.addEventListener("change", () => {
    // если день не active — не даём менять (на всякий)
    if (state.status !== "active") {
      cb.checked = !cb.checked; // откат
      return;
    }
    updateCounts();
    updateUI();
  });
});

if (btnStart) {
  btnStart.addEventListener("click", () => {
    if (state.status !== "locked") return;
    state.status = "active";
    updateCounts();
    updateUI();
  });
}

if (btnDone) {
  btnDone.addEventListener("click", () => {
    updateCounts();
    if (!(state.status === "active" && state.completedCount >= MIN_DONE_TASKS)) return;

    state.status = "completed";
    state.streak += 1; // пока упрощённо: закрытый день = +1 к streak
    updateUI();
  });
}

if (btnNext) {
  btnNext.addEventListener("click", () => {
    if (state.status !== "completed") return;

    // следующий день
    if (state.day < state.totalDays) state.day += 1;

    // сброс задач
    taskCheckboxes.forEach(cb => (cb.checked = false));

    // новый день locked
    state.status = "locked";
    updateCounts();
    updateUI();
  });
}

// ===== Init =====
updateCounts();
updateUI();