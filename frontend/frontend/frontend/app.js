const achievements = [
  { id: 1, title: "First Step", desc: "Complete your first action" },
  { id: 2, title: "Getting Started", desc: "3 days in a row" },
  { id: 3, title: "On Fire", desc: "7-day streak" },
  { id: 4, title: "Unstoppable", desc: "30 actions completed" },
];

function showAchievement(a) {
  alert(`${a.title}\n\n${a.desc}`);
}

const container = document.getElementById("achievements");

achievements.forEach(a => {
  const div = document.createElement("div");
  div.className = "achievement";
  div.innerText = a.title;
  div.onclick = () => showAchievement(a);
  container.appendChild(div);
});