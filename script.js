const cards = Array.from(document.querySelectorAll(".card"));
const randomBtn = document.getElementById("randomBtn");
const toast = document.getElementById("toast");
const confetti = document.getElementById("confetti");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 1100);
}

function popConfetti(emoji = "✨") {
  const count = 14;
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.textContent = emoji;
    s.style.left = Math.random() * 100 + "vw";
    s.style.animationDelay = (Math.random() * 120) + "ms";
    s.style.transform = `translateY(0) rotate(${Math.random() * 120}deg)`;
    confetti.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  }
}

function openRoute(btn) {
  const url = btn.dataset.url;
  const emoji = btn.dataset.confetti || "✨";
  popConfetti(emoji);
  showToast("Opening: " + new URL(url).pathname);
  window.open(url, "_blank", "noopener,noreferrer");
}

cards.forEach((btn) => btn.addEventListener("click", () => openRoute(btn)));

randomBtn.addEventListener("click", () => {
  const pick = cards[Math.floor(Math.random() * cards.length)];
  openRoute(pick);
});

document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "r") randomBtn.click();
});
