// --- tiny helpers (safe even if toast/confetti aren't present) ---
const toast = document.getElementById("toast");
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 1200);
}

showToast("JS loaded ✅"); // <- if you see this, your JS is running

// --- Wheel elements ---
const wheelCanvas = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");
const wheelResult = document.getElementById("wheelResult");

if (!wheelCanvas || !spinBtn) {
  console.error("Wheel elements not found. Check IDs: wheel, spinBtn");
} else {
  const ctx = wheelCanvas.getContext("2d");

  const slices = [
    { label: "Performance", url: "https://www.xjzhang.com/career" },
    { label: "Perspectives", url: "https://www.xjzhang.com/perspectives" },
    { label: "Purpose", url: "https://www.xjzhang.com/impacts" },
    { label: "People", url: "https://www.xjzhang.com/stanford" },
  ];

  let rotation = 0;
  let spinning = false;

  function drawWheel(rot) {
    const w = wheelCanvas.width;
    const h = wheelCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(cx, cy) - 12;

    ctx.clearRect(0, 0, w, h);

    const sliceAngle = (Math.PI * 2) / slices.length;

    for (let i = 0; i < slices.length; i++) {
      const start = rot + i * sliceAngle;
      const end = start + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)";
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.lineWidth = 3;
      ctx.stroke();

      // label
      const mid = (start + end) / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.font = "bold 18px system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.fillText(slices[i].label, r - 14, 6);
      ctx.restore();
    }

    // center cap
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.20)";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function normalizeAngle(a) {
    const twoPi = Math.PI * 2;
    return ((a % twoPi) + twoPi) % twoPi;
  }

  function pickSliceIndex(finalRotation) {
    // pointer is at top. pointer angle is 3π/2 in canvas coordinates.
    const sliceAngle = (Math.PI * 2) / slices.length;
    const pointerAngle = (Math.PI * 3) / 2;

    const wheelAngleAtPointer = normalizeAngle(pointerAngle - finalRotation);
    return Math.floor(wheelAngleAtPointer / sliceAngle);
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function spin() {
    if (spinning) return;
    spinning = true;
    spinBtn.disabled = true;
    if (wheelResult) wheelResult.textContent = "Spinning…";

    const start = rotation;
    const extraTurns = 4 + Math.random() * 3;
    const target = start + extraTurns * Math.PI * 2 + Math.random() * Math.PI * 2;
    const delta = target - start;

    const duration = 2200;
    const t0 = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - t0) / duration);
      rotation = start + delta * easeOut(t);
      drawWheel(rotation);

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        rotation = target;
        drawWheel(rotation);

        const idx = pickSliceIndex(rotation);
        const chosen = slices[idx];

        showToast(`Chosen: ${chosen.label}`);
        if (wheelResult) wheelResult.textContent = `Result: ${chosen.label} — opening…`;

        setTimeout(() => {
          window.open(chosen.url, "_blank", "noopener,noreferrer");
          if (wheelResult) wheelResult.textContent = `Result: ${chosen.label}`;
          spinning = false;
          spinBtn.disabled = false;
        }, 350);
      }
    }

    requestAnimationFrame(frame);
  }

  // Make canvas crisp and clickable
  function setupCanvas() {
    const cssSize = Math.min(420, Math.max(280, wheelCanvas.parentElement?.clientWidth || 360));
    wheelCanvas.style.width = cssSize + "px";
    wheelCanvas.style.height = cssSize + "px";

    // HiDPI for sharpness
    wheelCanvas.width = cssSize * 2;
    wheelCanvas.height = cssSize * 2;

    drawWheel(rotation);
  }

  setupCanvas();
  window.addEventListener("resize", setupCanvas);

  spinBtn.addEventListener("click", spin);
  wheelCanvas.addEventListener("click", spin);

  showToast("Wheel ready 🎡");
}

// --- Keep your existing card / random behavior if present ---
const cards = Array.from(document.querySelectorAll(".card"));
const randomBtn = document.getElementById("randomBtn");

function openRoute(btn) {
  const url = btn.dataset.url;
  if (!url) return;
  showToast("Opening: " + new URL(url).pathname);
  window.open(url, "_blank", "noopener,noreferrer");
}

cards.forEach((btn) => btn.addEventListener("click", () => openRoute(btn)));

if (randomBtn) {
  randomBtn.addEventListener("click", () => {
    const pick = cards[Math.floor(Math.random() * cards.length)];
    if (pick) openRoute(pick);
  });
}
