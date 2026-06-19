/* =====================================================================
   APLIKACJA — stan, mapa, nawigacja, modale, finał
   ===================================================================== */

const STORE_KEY = "podroz_progress_v1";

const app = {
  get progress() {
    return parseInt(localStorage.getItem(STORE_KEY) || "0", 10);
  },
  set progress(v) {
    localStorage.setItem(STORE_KEY, String(v));
  },
};

// elementy
const screens = {
  gate: document.getElementById("gate-screen"),
  map: document.getElementById("map-screen"),
  game: document.getElementById("game-screen"),
  final: document.getElementById("final-screen"),
};
const gameContent = document.getElementById("game-content");

let activeIndex = null;

/* ---------- nawigacja ekranów ---------- */
function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");
  window.scrollTo(0, 0);
}

/* ---------- zdjęcia z fallbackiem ---------- */
function photoHTML(src, phText) {
  return (
    `<img src="${src}" alt="" ` +
    `onerror="this.style.display='none';this.parentNode.querySelector('.ph').style.display='block'">` +
    `<span class="ph" style="display:none"><span class="big">📷</span>${phText}</span>`
  );
}

/* ---------- EKRAN STARTOWY (BRAMA) ---------- */
function showGate() {
  const g = CONFIG.gate;
  document.getElementById("gate-question").textContent = g.question;
  document.getElementById("gate-gram-label").textContent = g.gramLabel;
  document.getElementById("gate-pass-label").textContent = g.passLabel;
  document.getElementById("gate-gram-photo").innerHTML = photoHTML(
    CONFIG.photos.gram,
    "Zdjęcie „GRAM”"
  );
  document.getElementById("gate-pass-photo").innerHTML = photoHTML(
    CONFIG.photos.pass,
    "Zdjęcie „PASS”"
  );
  showScreen("gate");
}

/* ---------- MAPA ŚWIATA ---------- */
const SVGNS = "http://www.w3.org/2000/svg";

function renderMap() {
  const nodesWrap = document.getElementById("worldmap-nodes");
  const land = document.getElementById("worldmap-land");
  const paths = document.getElementById("worldmap-paths");

  // ląd (kadr mapy świata) — rysujemy raz
  land.setAttribute("viewBox", mapViewBox());
  document.getElementById("land-path").setAttribute("d", WORLD_PATH);

  nodesWrap.innerHTML = "";
  const progress = app.progress;
  const pts = LOCATIONS.map((l) => geoToPct(l.lat, l.lon));

  LOCATIONS.forEach((loc, i) => {
    const p = pts[i];
    const node = document.createElement("div");
    node.className = "node";
    node.style.left = p.left + "%";
    node.style.top = p.top + "%";

    let state, stateTxt, lock = "";
    if (i < progress) {
      state = "done";
      stateTxt = "✓ ukończono";
    } else if (i === progress) {
      state = "current";
      stateTxt = loc.game === "final" ? "▶ finał!" : "▶ zagraj";
      node.dataset.current = "1";
    } else {
      state = "locked";
      stateTxt = "";
      lock = '<span class="lock">🔒</span>';
    }
    node.classList.add(state);
    node.innerHTML =
      `${lock}<div class="node-pin"><span>${loc.emoji}</span></div>` +
      `<div class="node-label">${loc.name}</div>` +
      `<div class="node-state">${stateTxt}</div>`;

    if (state !== "locked") node.addEventListener("click", () => openLocation(i));
    nodesWrap.appendChild(node);
  });

  drawPaths(paths, pts, progress);
}

function drawPaths(svg, pts, progress) {
  svg.innerHTML = ""; // viewBox 0 0 100 100, współrzędne w %
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i],
      b = pts[i + 1];
    const path = document.createElementNS(SVGNS, "path");
    const mx = (a.left + b.left) / 2;
    const my = (a.top + b.top) / 2 - 7; // lekki łuk
    path.setAttribute("d", `M ${a.left} ${a.top} Q ${mx} ${my} ${b.left} ${b.top}`);
    const reached = i < progress;
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", reached ? "#FBE122" : "rgba(255,255,255,.35)");
    path.setAttribute("stroke-width", reached ? "2.2" : "1.6");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("vector-effect", "non-scaling-stroke");
    if (!reached) path.setAttribute("stroke-dasharray", "5 6");
    svg.appendChild(path);
  }
}

/* ---------- OTWIERANIE LOKACJI ---------- */
function openLocation(i) {
  const loc = LOCATIONS[i];
  activeIndex = i;

  if (loc.game === "final") {
    app.progress = Math.max(app.progress, LOCATIONS.length);
    showFinal();
    return;
  }

  showScreen("game");
  GAMES[loc.game](gameContent, loc, {
    onWin: () => handleWin(i),
    onLose: () => handleLose(i),
  });
}

function handleWin(i) {
  if (i + 1 > app.progress) app.progress = i + 1;
  fireConfetti();
  const loc = LOCATIONS[i];
  const isLastGame = i + 1 >= LOCATIONS.length - 1; // ostatnia gra przed finałem
  const w = loc.win || {};
  const title = w.title || rand(CONFIG.winLines);
  const text =
    w.text != null
      ? w.text
      : isLastGame
      ? "To była ostatnia próba! Wróć na mapę i kliknij Polskę 🇵🇱"
      : "Lokacja odblokowana — ruszaj dalej!";
  showModal({
    type: "win",
    title,
    text,
    photo: w.photo || CONFIG.photos.win,
    phText: "Tu pojawi się zdjęcie kolegi (wygrana)",
    btn: "Dalej ➜",
    onClose: () => {
      renderMap();
      showScreen("map");
    },
  });
}

function handleLose(i) {
  showGameOver(i); // nagranie + wybuchający GAME OVER + spróbuj ponownie
}

/* ---------- GAME OVER (po błędnej odpowiedzi) ---------- */
function showGameOver(i) {
  const ov = document.getElementById("gameover");
  const vid = document.getElementById("gameover-video");
  const txt = document.getElementById("gameover-text");

  ov.classList.add("show");
  try {
    vid.currentTime = 0;
    vid.muted = false;
    vid.volume = 1.0; // maksymalna głośność
    const p = vid.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) {}

  // ponów animację „wybuchu"
  txt.classList.remove("boom");
  void txt.offsetWidth; // wymuś reflow, by animacja zagrała od nowa
  txt.classList.add("boom");

  document.getElementById("gameover-btn").onclick = () => {
    ov.classList.remove("show");
    try { vid.pause(); } catch (e) {}
    openLocation(i); // restart tej samej gry
  };
}

/* ---------- MODAL ---------- */
const modal = document.getElementById("modal");
function showModal({ type, title, text, photo, phText, btn, onClose }) {
  modal.className = "modal show " + type;
  document.getElementById("modal-photo").innerHTML = photoHTML(photo, phText);
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-text").textContent = text;
  const b = document.getElementById("modal-btn");
  b.textContent = btn;
  b.onclick = () => {
    modal.className = "modal";
    onClose && onClose();
  };
}

/* ---------- FINAŁ ---------- */
function showFinal() {
  fireConfetti(true);
  const f = CONFIG.final;
  screens.final.innerHTML = `
    <div class="final-inner">
      <div class="final-trophy">🏆</div>
      <div class="final-photo">${photoHTML(
        CONFIG.photos.final,
        "Zdjęcie kolegi"
      )}</div>
      <h1 class="final-title">${f.title}</h1>
      <p class="final-msg">${f.message.replace(/\n/g, "<br>")}</p>
      <div class="final-card">
        <div class="final-gift">${f.gift}</div>
        <div class="label" style="margin-top:14px">${f.phoneLabel}</div>
        <a class="final-phone" href="tel:${f.phone.replace(/\s/g, "")}">${f.phone}</a>
      </div>
      <button class="btn btn-ghost" id="final-map">← Wróć na mapę</button>
    </div>`;
  showScreen("final");
  document
    .getElementById("final-map")
    .addEventListener("click", () => {
      renderMap();
      showScreen("map");
    });
}

/* ---------- KONFETTI ---------- */
const fx = document.getElementById("fx");
const fxc = fx.getContext("2d");
let parts = [];
function fireConfetti(big = false) {
  fx.width = innerWidth;
  fx.height = innerHeight;
  const colors = ["#DA291C", "#FBE122", "#ffffff", "#21c46b"];
  const n = big ? 160 : 80;
  for (let i = 0; i < n; i++) {
    parts.push({
      x: innerWidth / 2,
      y: innerHeight * 0.3,
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -12 - 4,
      g: 0.4,
      s: Math.random() * 8 + 4,
      c: colors[(Math.random() * colors.length) | 0],
      life: 90,
    });
  }
  if (!fxRunning) loopFx();
}
let fxRunning = false;
function loopFx() {
  fxRunning = true;
  fxc.clearRect(0, 0, fx.width, fx.height);
  parts.forEach((p) => {
    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    fxc.fillStyle = p.c;
    fxc.fillRect(p.x, p.y, p.s, p.s);
  });
  parts = parts.filter((p) => p.life > 0 && p.y < fx.height + 20);
  if (parts.length) requestAnimationFrame(loopFx);
  else {
    fxc.clearRect(0, 0, fx.width, fx.height);
    fxRunning = false;
  }
}

/* ---------- POMOCNICZE ---------- */
function rand(arr) {
  return arr[(Math.random() * arr.length) | 0];
}

/* ---------- LICZNIK CZASU + POPUP „CZAS NA DRINA!" ---------- */
let timerInt = null,
  timerStart = 0,
  drinkMinute = 0;

function startTimer() {
  if (timerInt) return; // już idzie — nie resetuj przy powrotach na mapę
  timerStart = Date.now();
  drinkMinute = 0;
  document.getElementById("timer").style.display = "block";
  tickTimer();
  timerInt = setInterval(tickTimer, 1000);
}
function resetTimer() {
  if (timerInt) {
    clearInterval(timerInt);
    timerInt = null;
  }
  const el = document.getElementById("timer");
  el.style.display = "none";
  el.textContent = "00:00";
}
function tickTimer() {
  const sec = Math.floor((Date.now() - timerStart) / 1000);
  const m = Math.floor(sec / 60),
    s = sec % 60;
  document.getElementById("timer").textContent =
    String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  // co pełną minutę popup (jeśli nie ma już otwartego okienka)
  if (m > drinkMinute && !overlayOpen()) {
    drinkMinute = m;
    showDrink();
  }
}
function overlayOpen() {
  return (
    document.getElementById("modal").classList.contains("show") ||
    document.getElementById("gameover").classList.contains("show")
  );
}
function showDrink() {
  const pool = CONFIG.drink.photos || [];
  const photo = pool.length
    ? pool[(Math.random() * pool.length) | 0] // losowe zdjęcie z folderu PIJE
    : CONFIG.photos.drink;
  showModal({
    type: "drink",
    title: CONFIG.drink.title,
    text: CONFIG.drink.text,
    photo,
    phText: "(zdjęcie z folderu PIJE)",
    btn: CONFIG.drink.btn,
    onClose: null,
  });
}

/* ---------- PRZYCISKI GLOBALNE ---------- */
document.getElementById("reset-btn").addEventListener("click", () => {
  if (confirm("Zrestartować całą grę? Postęp zostanie skasowany.")) {
    localStorage.removeItem(STORE_KEY);
    resetTimer();
    showGate();
  }
});

// brama: wybór GRAM / PASS
document.getElementById("gate-gram").addEventListener("click", () => {
  // odblokuj audio nagrania w geście użytkownika (Safari/iOS) — gra bez dźwięku,
  // ale „rozgrzewa" element, by późniejsze play() z dźwiękiem było dozwolone
  const vid = document.getElementById("gameover-video");
  try {
    vid.muted = false;
    vid.volume = 0; // bez słyszalnego dźwięku przy odblokowaniu
    vid.play().then(() => { vid.pause(); vid.currentTime = 0; }).catch(() => {});
  } catch (e) {}
  startTimer(); // licznik startuje z początkiem gry
  renderMap();
  showScreen("map");
});
document.getElementById("gate-pass").addEventListener("click", () => {
  showModal({
    type: "lose",
    title: CONFIG.gate.passTitle,
    text: CONFIG.gate.passText,
    photo: CONFIG.photos.pass,
    phText: "(miejsce na zdjęcie)",
    btn: CONFIG.gate.passBtn,
    onClose: null, // zostajemy na bramie
  });
});
document.getElementById("back-btn").addEventListener("click", () => {
  renderMap();
  showScreen("map");
});
window.addEventListener("resize", () => {
  if (screens.map.classList.contains("active")) renderMap();
});

/* ---------- START ---------- */
document.title = CONFIG.gameName;
document.getElementById("app-title").textContent = CONFIG.gameName;
showGate();
