const $ = (id) => document.getElementById(id);

const elList = $("achievements");
const elStatus = $("status");

const modal = $("modal");
const modalTitle = $("modalTitle");
const modalDesc = $("modalDesc");
const modalReq = $("modalReq");
const modalProg = $("modalProg");

function openModal(a){
  modalTitle.textContent = a.title;
  modalDesc.textContent = a.description;
  modalReq.textContent = a.requirement;
  modalProg.textContent = `${a.progress.current}/${a.progress.total}`;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(){
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

$("modalClose").addEventListener("click", closeModal);
$("modalX").addEventListener("click", closeModal);
$("modalOk").addEventListener("click", closeModal);

function render(list){
  elList.innerHTML = "";
  list.forEach((a) => {
    const card = document.createElement("div");
    card.className = "ach";
    card.innerHTML = `
      <p class="ach__title">${a.title}</p>
      <p class="ach__desc">${a.description}</p>
      <span class="badge">Tap to view</span>
    `;
    card.addEventListener("click", () => openModal(a));
    elList.appendChild(card);
  });
}

async function loadAchievements(){
  elStatus.textContent = "Loading…";
  try{
    // Если у тебя пока нет backend — используем локальный fallback:
    const local = [
      { id:"streak3", title:"3-Day Streak", description:"Do any daily action 3 days in a row.", requirement:"3 consecutive days", progress:{current:1,total:3}},
      { id:"firstxp", title:"First XP", description:"Earn your first 50 XP.", requirement:"50 XP", progress:{current:10,total:50}},
      { id:"planner", title:"Planner", description:"Create 5 tasks in one day.", requirement:"5 tasks/day", progress:{current:2,total:5}},
      { id:"focus", title:"Focus Sprint", description:"Complete a 25-minute focus sprint.", requirement:"1 sprint", progress:{current:0,total:1}},
      { id:"water", title:"Hydration", description:"Drink water 2L in a day.", requirement:"2 liters", progress:{current:0,total:2}},
      { id:"level2", title:"Level Up", description:"Reach level 2.", requirement:"Level 2", progress:{current:1,total:2}},
    ];

    // Попробуем API, если появится позже:
    // const r = await fetch("/api/achievements");
    // if(!r.ok) throw new Error("No API yet");
    // const data = await r.json();
    // render(data);

    render(local);
    elStatus.textContent = "Ready. Tap any achievement.";
  }catch(e){
    elStatus.textContent = "Failed to load achievements.";
  }
}

$("refresh").addEventListener("click", loadAchievements);
window.addEventListener("load", loadAchievements);