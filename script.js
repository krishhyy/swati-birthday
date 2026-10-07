const intro = document.getElementById('intro');
const experience = document.getElementById('experience');
const openBtn = document.getElementById('openBtn');
const music = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
const musicText = document.getElementById('musicText');
const heartLayer = document.getElementById('heartLayer');
const toast = document.getElementById('toast');
const replayBtn = document.getElementById('replayBtn');
let z = 10;
let started = false;

music.volume = 0.38;

function hearts(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 5) {
  for (let i = 0; i < count; i++) {
    const h = document.createElement('span');
    h.className = 'floating-heart';
    h.textContent = Math.random() > .3 ? '♥' : '✦';
    h.style.left = `${x + (Math.random() * 80 - 40)}px`;
    h.style.top = `${y + (Math.random() * 30 - 15)}px`;
    h.style.animationDelay = `${Math.random() * .25}s`;
    h.style.fontSize = `${12 + Math.random() * 14}px`;
    heartLayer.appendChild(h);
    setTimeout(() => h.remove(), 2200);
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

async function startExperience() {
  if (started) return;
  started = true;
  intro.classList.add('hidden');
  experience.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => experience.classList.add('ready'));
  try { await music.play(); } catch (_) {}
  hearts(window.innerWidth / 2, window.innerHeight * .55, 12);
  setTimeout(() => showToast('music is playing ♫'), 700);
}
openBtn.addEventListener('click', startExperience);

musicBtn.addEventListener('click', async () => {
  if (music.paused) {
    try { await music.play(); } catch (_) {}
    musicBtn.classList.remove('off');
    musicText.textContent = 'music on';
  } else {
    music.pause();
    musicBtn.classList.add('off');
    musicText.textContent = 'music off';
  }
});

// Lightweight pointer dragging. Default positions stay exactly where CSS places them;
// dragging only changes left/top offsets from that starting point.
const papers = [...document.querySelectorAll('.paper')];
z = 110;
papers.forEach((paper) => {
  const baseRotation = Number(paper.dataset.tilt || 0);
  let dragging = false;
  let startX = 0, startY = 0;
  let originLeft = 0, originTop = 0;
  let currentLeft = 0, currentTop = 0;
  let velocityX = 0, velocityY = 0, lastX = 0, lastY = 0;

  const setPosition = (left, top, rotation = baseRotation) => {
    paper.style.left = `${left}%`;
    paper.style.top = `${top}%`;
    paper.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    currentLeft = left;
    currentTop = top;
  };

  paper.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true;
    paper.setPointerCapture(e.pointerId);
    paper.style.zIndex = ++z;
    const rect = paper.parentElement.getBoundingClientRect();
    const currentRect = paper.getBoundingClientRect();
    originLeft = ((currentRect.left + currentRect.width / 2 - rect.left) / rect.width) * 100;
    originTop = ((currentRect.top + currentRect.height / 2 - rect.top) / rect.height) * 100;
    currentLeft = originLeft;
    currentTop = originTop;
    startX = e.clientX;
    startY = e.clientY;
    lastX = e.clientX;
    lastY = e.clientY;
    velocityX = velocityY = 0;
    paper.style.transition = 'none';
    paper.style.cursor = 'grabbing';
  });

  paper.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const stage = paper.parentElement.getBoundingClientRect();
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const left = originLeft + (dx / stage.width) * 100;
    const top = originTop + (dy / stage.height) * 100;
    velocityX = e.clientX - lastX;
    velocityY = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    setPosition(left, top, baseRotation + Math.max(-8, Math.min(8, velocityX * .35)));
  });

  paper.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    paper.releasePointerCapture?.(e.pointerId);
    paper.style.cursor = 'grab';
    paper.style.transition = 'transform .28s cubic-bezier(.2,.85,.25,1), left .28s cubic-bezier(.2,.85,.25,1), top .28s cubic-bezier(.2,.85,.25,1), box-shadow .25s ease';

    const stage = paper.parentElement.getBoundingClientRect();
    let left = currentLeft + (velocityX * 1.2 / stage.width) * 100;
    let top = currentTop + (velocityY * 1.2 / stage.height) * 100;
    left = Math.max(-15, Math.min(115, left));
    top = Math.max(-10, Math.min(110, top));
    setPosition(left, top, baseRotation);

    if (Math.abs(velocityX) + Math.abs(velocityY) > 18) hearts(e.clientX, e.clientY, 3);
  });

  paper.addEventListener('dblclick', (e) => {
    hearts(e.clientX, e.clientY, 7);
    showToast('okay okay... I see you found this one ♡');
  });
});

// Tiny interactive discoveries on the background.
document.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.paper, button')) return;
  if (started && Math.random() < .35) hearts(e.clientX, e.clientY, 2);
});

replayBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => {
    intro.classList.remove('hidden');
    experience.classList.remove('ready');
    started = false;
  }, 450);
});

// Give the opening scene a gentle first-load reveal.
window.addEventListener('load', () => {
  document.querySelector('.intro-card').animate([
    { opacity: 0, transform: 'translateY(18px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ], { duration: 900, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
});
