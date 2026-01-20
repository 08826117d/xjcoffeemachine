const cards = Array.from(document.querySelectorAll(".card"));
const randomBtn = document.getElementById("randomBtn");
const toast = document.getElementById("toast");
const confetti = document.getElementById("confetti");

// ---------- existing helpers ----------
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
    s.style.animationDelay = Math.random() * 120 + "ms";
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

// ---------- wheel quiz ----------
const wheelCanvas = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");
const wheelResult = document.getElementById("wheelResult");

if (wheelCanvas && spinBtn) {
  const ctx = wheelCanvas.getContext("2d");

  // Define the 4 outcomes (label + where to send people)
  const slices = [
    { label: "Performance", url: "https://www.xjzhang.com/career", emoji: "💼" },
    { label: "Perspectives", url: "https://www.xjzhang.com/perspectives", emoji: "🧠" },
    { label: "Purpose", url: "https://www.xjzhang.com/impacts", emoji: "🌱" },
    { label: "People", url: "https://www.xjzhang.com/stanford", emoji: "🎓" },
  ];

  // Canvas sizing (handle CSS resize on mobile)
  function getSize() {
    const rect = wheelCanvas.getBoundingClientRect();
    // Use attribute size for crispness
    const size = Math.min(360, Math.round(rect.width || 360));
    return size || 360;
  }

  function resizeCanvas() {
    const size = getSize();
    wheelCanvas.width = size * 2;   // hiDPI
    wheelCanvas.height = size * 2;
    wheelCanvas.style.width = size + "px";
    wheelCanvas.style.height = size + "px";
    drawWheel(rotation);
  }

  let rotation = 0; // radians
  let spinning = false;

  function drawWheel(rot) {
    const w = wheelCanvas.width;
    const h = wheelCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(cx, cy) - 20;

    ctx.clearRect(0, 0, w, h);

    // background ring
    ctx.beginPath();
    ctx.arc(cx, cy, r + 10, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fill();

    const sliceAngle = (Math.PI * 2) / slices.length;

    for (let i = 0; i < slices.length; i++) {
      const start = rot + i * sliceAngle;
      const end = start + sliceAngle;

      // Alternate slice shades (no custom colors needed; keep neutral)
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.06)";
      ctx.fill();

      // slice border
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 4;
      ctx.stroke();

      // text
      const mid = (start + end) / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.font = "bold 34px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
      ctx.fillText(`${slices[i].emoji} ${slices[i].label}`, r - 14, 12);
      ctx.restore();
    }

    // center cap
    ctx.beginPath();
    ctx.arc(cx, cy, 34, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.20)";
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  function normalizeAngle(a) {
    const twoPi = Math.PI * 2;
    return ((a % twoPi) + twoPi) % twoPi;
  }

  function pickSliceIndex(finalRotation) {
    // Pointer is at the top (angle -90°). Our wheel drawing starts at angle 0 on x-axis,
    // so we map the top pointer to angle 3π/2.
    const sliceAngle = (Math.PI * 2) / slices.length;
    const pointerAngle = (Math.PI * 3) / 2;

    const wheelAngleAtPointer = normalizeAngle(pointerAngle - finalRotation);
    const index = Math.floor(wheelAngleAtPointer / sliceAngle);
    return Math.max(0, Math.min(slices.length - 1, index));
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function spin() {
    if (spinning) return;
    spinning = true;
    spinBtn.disabled = true;
    wheelResult.textContent = "";

    // Random spins + random extra angle
    const extraSpins = 4 + Math.random() * 3; // 4–7 turns
    const target = rotation + extraSpins * Math.PI * 2 + Math.random() * Math.PI * 2;

    const start = rotation;
    const delta = target - start;

    const duration = 2200 + Math.random() * 700; // ~2.2–2.9s
    const t0 = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - t0) / duration);
      rotation = start + delta * easeOutCubic(t);
      drawWheel(rotation);

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        // Finalize
        rotation = target;
        drawWheel(rotation);

        const idx = pickSliceIndex(rotation);
        const chosen = slices[idx];

        popConfetti(chosen.emoji);
        showToast(`Chosen: ${chosen.label}`);
        wheelResult.textContent = `Result: ${chosen.label} — opening…`;

        // Open after a tiny delay (feels nicer)
        setTimeout(() => {
          window.open(chosen.url, "_blank", "noopener,noreferrer");
          wheelResult.textContent = `Result: ${chosen.label}`;
          spinning = false;
          spinBtn.disabled = false;
        }, 450);
      }
    }

    requestAnimationFrame(frame);
  }

  // Initial render
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  spinBtn.addEventListener("click", spin);

  // Keyboard shortcut
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "s") spin();
  });
}
