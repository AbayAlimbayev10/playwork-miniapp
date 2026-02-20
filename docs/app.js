/* PlayWork Mini App v1.0
   - 30 days
   - 4 tasks per day
   - Start -> tasks active
   - Done -> if all checked enables Next day
   - Streak increments each day completed
   - Saves in localStorage
*/

const TOTAL_DAYS = 30;
const TASKS_PER_DAY = 4;
const STORAGE_KEY = "playwork_state_v1";

const el = {
  chipDay: document.getElementById("chipDay"),
  chipStatus: document.getElementById("chipStatus"),
  hintText: document.getElementById("hintText"),
  progressCount: document.getElementById("progressCount"),
  progressTotal: document.getElementById("progressTotal"),
  streakVal: document.getElementById("streakVal"),
  barFill: document.getElementById("barFill"),
  tasksList: document.getElementById("tasksList"),
  startBtn: document.getElementById("startBtn"),
  doneBtn: document.getElementById("doneBtn"),
  nextBtn: document.getElementById("nextBtn"),
  resetBtn: document.getElementById("resetBtn"),
  tgClose: document.getElementById("tgClose"),
};

function defaultState() {
  return {
    day: 1,
    started: false,
    completedToday: false,
    streak: 0,
    // хранит чекбоксы текущего дня
    checks: Array(TASKS_PER_DAY).fill(false),
    // чтобы “не прыгал” набор задач, сохраняем тексты на день
    tasksText: buildTasksForDay(1),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);

    // мини-валидатор
    if (!parsed || typeof parsed !== "object") return defaultState();
    if (!parsed.day) return defaultState();

    // поправим длины массивов
    if (!Array.isArray(parsed.checks) || parsed.checks.length !== TASKS_PER_DAY) {
      parsed.checks = Array(TASKS_PER_DAY).fill(false);
    }
    if (!Array.isArray(parsed.tasksText) || parsed.tasksText.length !== TASKS_PER_DAY) {
      parsed.tasksText = buildTasksForDay(parsed.day);
    }

    // границы
    parsed.day = clamp(parsed.day, 1, TOTAL_DAYS);
    parsed.streak = Math.max(0, parsed.streak | 0);
    parsed.started = !!parsed.started;
    parsed.completedToday = !!parsed.completedToday;

    return parsed;
  } catch (e) {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

// Простой “пул” задач. Можно потом заменить на реальные.
const TASK_POOL = [
  ["Focus Sprint", "25 минут без отвлечений"],
  ["Body", "10–15 минут движения/разминки"],
  ["Learning", "10 минут: чтение / курс"],
  ["Clarity", "Запиши 3 приоритета дня"],
  ["Outreach", "1 полезное сообщение/контакт"],
  ["Order", "5 минут: уборка рабочего места"],
  ["Money", "1 действие для дохода"],
  ["Health", "Вода + лёгкая прогулка"],
  ["Plan", "План на завтра (3 пункта)"],
  ["Mind", "1 минута дыхания/тишины"],
];

function buildTasksForDay(day) {
  // детерминированный выбор (чтобы день 7 всегда одинаковый)
  // простая формула псевдо-рандома
  const tasks = [];
  for (let i = 0; i < TASKS_PER_DAY; i++) {
    const idx = (day * 7 + i * 3) % TASK_POOL.length;
    const [title, desc] = TASK_POOL[idx];
    tasks.push({ title, desc });
  }
  return tasks;
}

let state = loadState();

// Telegram WebApp (не ломает работу в браузере)
const tg = window.Telegram?.WebApp;
if (tg) {
  try {
    tg.ready();
    tg.expand();
  } catch (_) {}
}

function computeProgress() {
  const done = state.checks.filter(Boolean).length;
  return done;
}

function statusText() {
  if (state.completedToday) return "Completed";
  return state.started ? "In progress" : "Not started";
}

function render() {
  // chips
  el.chipDay.textContent = `Day ${state.day} / ${TOTAL_DAYS}`;
  el.chipStatus.textContent = statusText();

  // hint
  if (!state.started) el.hintText.textContent = "Нажми Start, чтобы начать день";
  else if (!state.completedToday) el.hintText.textContent = "Отметь все задачи и нажми Done";
  else el.hintText.textContent = "День завершён. Нажми Next day →";

  // progress + bar
  const done = computeProgress();
  el.progressCount.textContent = String(done);
  el.progressTotal.textContent = String(TASKS_PER_DAY);
  el.streakVal.textContent = String(state.streak);

  const pct = Math.round((done / TASKS_PER_DAY) * 100);
  el.barFill.style.width = `${pct}%`;

  // buttons
  el.startBtn.disabled = state.started; // старт только один раз
  el.doneBtn.disabled = !(state.started && !state.completedToday && done === TASKS_PER_DAY);
  el.nextBtn.disabled = !state.completedToday;

  // tasks list
  el.tasksList.innerHTML = "";
  const tasks = state.tasksText;

  tasks.forEach((t, i) => {
    const li = document.createElement("li");
    li.className = "task" + (state.checks[i] ? " done" : "");

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!state.checks[i];
    cb.disabled = !state.started || state.completedToday;

    cb.addEventListener("change", () => {
      state.checks[i] = cb.checked;
      saveState();
      render();
    });

    const textWrap = document.createElement("div");
    textWrap.className = "txt";
    textWrap.innerHTML = `<strong>${escapeHtml(t.title)}</strong><small>${escapeHtml(t.desc)}</small>`;

    li.appendChild(cb);
    li.appendChild(textWrap);
    el.tasksList.appendChild(li);
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Actions
el.startBtn.addEventListener("click", () => {
  state.started = true;
  state.completedToday = false;

  // если задачи почему-то пустые — восстановим
  if (!Array.isArray(state.tasksText) || state.tasksText.length !== TASKS_PER_DAY) {
    state.tasksText = buildTasksForDay(state.day);
  }

  saveState();
  render();
});

el.doneBtn.addEventListener("click", () => {
  const done = computeProgress();
  if (done !== TASKS_PER_DAY) return;

  state.completedToday = true;
  state.streak += 1;
  saveState();

  // haptic / feedback в Telegram
  if (tg?.HapticFeedback) {
    try { tg.HapticFeedback.notificationOccurred("success"); } catch (_) {}
  }

  render();
});

el.nextBtn.addEventListener("click", () => {
  if (!state.completedToday) return;

  if (state.day >= TOTAL_DAYS) {
    // финиш
    state.started = false;
    state.completedToday = false;
    state.checks = Array(TASKS_PER_DAY).fill(false);
    state.tasksText = buildTasksForDay(state.day);
    saveState();
    alert("30/30 ✅ Ты завершил программу!");
    render();
    return;
  }

  // следующий день
  state.day += 1;
  state.started = false;
  state.completedToday = false;
  state.checks = Array(TASKS_PER_DAY).fill(false);
  state.tasksText = buildTasksForDay(state.day);

  saveState();
  render();

  if (tg?.HapticFeedback) {
    try { tg.HapticFeedback.impactOccurred("light"); } catch (_) {}
  }
});

el.resetBtn.addEventListener("click", () => {
  const ok = confirm("Сбросить прогресс полностью?");
  if (!ok) return;

  state = defaultState();
  saveState();
  render();

  if (tg?.HapticFeedback) {
    try { tg.HapticFeedback.notificationOccurred("warning"); } catch (_) {}
  }
});

el.tgClose.addEventListener("click", () => {
  if (tg?.close) tg.close();
  else window.close();
});

// init
render();