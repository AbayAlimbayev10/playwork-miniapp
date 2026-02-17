;const tg = window.Telegram?.WebApp;

if (!tg) {
  console.log("Not in Telegram");
} else {
  tg.expand();
  console.log("In Telegram", tg.initDataUnsafe?.user);
}const tg = window.Telegram.WebApp;
tg.expand();

document.getElementById("status").innerText =
  tg.initDataUnsafe?.user
    ? `Hello, ${tg.initDataUnsafe.user.first_name}`
    : "Opened outside Telegram";

if (tg.initDataUnsafe?.user) {
  document.getElementById("startBtn").style.display = "block";
}

document.getElementById("startBtn").onclick = () => {
  alert("PlayWork started");
};