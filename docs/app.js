(function () {
  const TOTAL_DAYS = 30;

  // ====== ДАННЫЕ: 30 дней + задания ======
  // Меняй текст задач как хочешь.
  const DAYS = Array.from({ length: TOTAL_DAYS }, (_, i) => {
    const d = i + 1;
    return {
      title: `Day ${d}`,
      desc: d === 1 ? "Стартуем. Сделай минимум и зафиксируй результат." : "Выполни задания и закрой день.",
      tasks: [
        { t: "Сделать 1 ключевое действие на прогресс (15–30 минут)", note: "Без перфекционизма. Просто сделай." },
        { t: "Короткая проверка состояния (сон/энергия/фокус)", note: "Оцени по шкале 1–10 и запиши." },
        { t: "1 маленький шаг в проекте PlayWork", note: "Например: текст, дизайн, список идей, тест." },
      ],
    };
  });

  // ====== Telegram WebApp (безопасно, если не в Telegram) ======
  const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
  if (tg) {
    tg.ready();
    tg.expand();
  }

  // ====== DOM ======
  const dayTitle = document.getElementById("dayTitle");
  const dayDesc = document.getElementById("dayDesc");
  const dayPill = document.getElementById("dayPill");
  const tasksList = document.getElementById("tasksList");
  const tasksCount = document.getElementById("tasksCount");

  const finishDayBtn = document.getElementById("finishDayBtn");
  const nextDayBtn = document.getElementById("nextDayBtn");
  const resetBtn = document.getElementById("resetBtn");
  const jumpTodayBtn = document.getElementById("jumpTodayBtn");

  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");
  const progressPct = document.getElementById("progressPct");
  const hintText = document.getElementById("hintText");

  // ====== STORAGE ======
  const KEY = "playwork_state_v1";

  function loadState() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function saveState(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function defaultState() {
    return {
      currentDay: 1,
      completedDays: {},
      checks: {}, // checks[day] = [true/false...]
      startedAt: Date.now(),
    };
  }

  let state = loadState() || defaultState();

  // защита
  if (!state.currentDay || state.currentDay < 1) state.currentDay = 1;
  if (state.currentDay > TOTAL_DAYS) state.currentDay = TOTAL_DAYS;

  // ====== UI RENDER ======
  function render() {
    const day = state.currentDay;
    const dayData = DAYS[day - 1];

    dayTitle.textContent = `PlayWork`;
    dayDesc.textContent = dayData.desc;
    dayPill.textContent = `Day ${day}`;

    // прогресс по дням
    const doneCount = Object.keys(state.completedDays).filter((k) => state.completedDays[k] === true).length;
    const pct = Math.round((doneCount / TOTAL_DAYS) * 100);

    progressFill.style.width = `${pct}%`;
    progressText.textContent = `${doneCount}/${TOTAL_DAYS}`;
    progressPct.textContent = `${pct}%`;

    // чек-лист текущего дня
    const checks = getChecksForDay(day, dayData.tasks.length);

    tasksList.innerHTML = "";
    dayData.tasks.forEach((task, idx) => {
      const isChecked = checks[idx] === true;

      const el = document.createElement("div");
      el.className = "task";
      el.setAttribute("data-idx", String(idx));

      const box = document.createElement("div");
      box.className = isChecked ? "checkbox checked" : "checkbox";

      const text = document.createElement("div");
      text.className = "taskText";

      const h = document.createElement("p");
      h.className = "taskTitle";
      h.textContent = task.t;

      const note = document.createElement("p");
      note.className = "taskNote";
      note.textContent = task.note || "";

      text.appendChild(h);
      if (task.note) text.appendChild(note);

      el.appendChild(box);
      el.appendChild(text);

      el.addEventListener("click", () => toggleTask(day, idx));

      tasksList.appendChild(el);
    });

    tasksCount.textContent = `${dayData.tasks.length} задач`;

    // кнопки
    const allChecked = checks.every((x) => x === true);
    const dayCompleted = state.completedDays[String(day)] === true;

    finishDayBtn.disabled = !(allChecked && !dayCompleted);
    nextDayBtn.disabled = !(dayCompleted && day < TOTAL_DAYS);

    if (dayCompleted) {
      hintText.textContent = "День завершён ✅ Можно перейти дальше.";
    } else if (allChecked) {
      hintText.textContent = "Все задания отмечены. Нажми «Завершить день».";
    } else {
      hintText.textContent = "Отметь все задания, чтобы завершить день.";
    }
  }

  function getChecksForDay(day, len) {
    const k = String(day);
    const arr = Array.isArray(state.checks[k]) ? state.checks[k] : Array(len).fill(false);
    if (arr.length !== len) {
      const fixed = Array(len).fill(false).map((_, i) => arr[i] === true);
      state.checks[k] = fixed;
      saveState(state);
      return fixed;
    }
    return arr;
  }

  function toggleTask(day, idx) {
    const dayData = DAYS[day - 1];
    const checks = getChecksForDay(day, dayData.tasks.length);
    checks[idx] = !checks[idx];
    state.checks[String(day)] = checks;
    saveState(state);
    render();
  }

  // ====== ACTIONS ======
  finishDayBtn.addEventListener("click", () => {
    const day = state.currentDay;
    state.completedDays[String(day)] = true;
    saveState(state);

    if (tg) {
      tg.HapticFeedback && tg.HapticFeedback.notificationOccurred("success");
    }
    render();
  });

  nextDayBtn.addEventListener("click", () => {
    if (state.currentDay < TOTAL_DAYS) {
      state.currentDay += 1;
      saveState(state);
      render();
    }
  });

  jumpTodayBtn.addEventListener("click", () => {
    // "текущий" — это первый незавершённый день
    let target = 1;
    for (let d = 1; d <= TOTAL_DAYS; d++) {
      if (state.completedDays[String(d)] !== true) {
        target = d;
        break;
      }
      target = d;
    }
    state.currentDay = target;
    saveState(state);
    render();
  });

  resetBtn.addEventListener("click", () => {
    const ok = confirm("Сбросить прогресс? Это удалит все отметки и дни.");
    if (!ok) return;
    state = defaultState();
    saveState(state);
    render();
  });

  // ====== START ======
  document.addEventListener("DOMContentLoaded", () => {
    // если открыто в Telegram — можно подстроить тему/цвета
    if (tg && tg.themeParams) {
      // Ничего критичного. Можно позже добавить динамическую тему.
    }
    render();
  });
})();