// عدّل الرابط بعد ما ترفع البوت على VPS
const API_URL = "http://localhost:4000/api/status";

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    document.getElementById("bot").innerText = data.bot;
    document.getElementById("servers").innerText = data.servers;
    document.getElementById("users").innerText = data.users;
    document.getElementById("api").innerText = "API Connected ✅";
    document.getElementById("status").innerText = "Online";
  })
  .catch(() => {
    document.getElementById("api").innerText = "API Offline ❌";
    document.getElementById("status").innerText = "Offline";
  });
