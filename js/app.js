/* =====================================================================
   APLIKACJA — stan, mapa, nawigacja, modale, finał
   ===================================================================== */

const MAP_ID_KEY = "podroz_map_v1";
let currentMapId = localStorage.getItem(MAP_ID_KEY) || "world";
function setMap(id) {
  currentMapId = id;
  localStorage.setItem(MAP_ID_KEY, id);
}

// postęp jest osobny dla każdej mapy (świat / Polska)
const app = {
  get progress() {
    return parseInt(localStorage.getItem(MAPS[currentMapId].storeKey) || "0", 10);
  },
  set progress(v) {
    localStorage.setItem(MAPS[currentMapId].storeKey, String(v));
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
  const map = MAPS[currentMapId];
  const locs = map.locations;
  const bounds = map.bounds;
  const nodesWrap = document.getElementById("worldmap-nodes");
  const land = document.getElementById("worldmap-land");
  const paths = document.getElementById("worldmap-paths");
  const inner = document.getElementById("worldmap-inner");

  // kadr lądu aktualnej mapy + proporcje kontenera (świat vs Polska)
  land.setAttribute("viewBox", mapViewBox(bounds));
  document.getElementById("land-path").setAttribute("d", map.path);
  inner.style.aspectRatio =
    bounds.lonMax - bounds.lonMin + " / " + (bounds.latMax - bounds.latMin);

  nodesWrap.innerHTML = "";
  const progress = app.progress;
  const pts = locs.map((l) => geoToPct(l.lat, l.lon, bounds));

  locs.forEach((loc, i) => {
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
      stateTxt =
        loc.game === "final" ? "▶ finał!" : loc.game === "submap" ? "▶ dalej!" : "▶ zagraj";
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

  // główka spoczywa na aktualnej (odblokowanej) lokacji
  placeAvatar(pts[Math.min(progress, locs.length - 1)]);

  // przycisk powrotu do mapy świata — tylko na mapie Polski
  document.getElementById("world-back-btn").style.display =
    currentMapId === "poland" ? "block" : "none";
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

/* ---------- AWATAR (główka wędrująca po trasie) ---------- */
function placeAvatar(pt) {
  const av = document.getElementById("map-avatar");
  if (!pt) return;
  av.style.left = pt.left + "%";
  av.style.top = pt.top + "%";
  av.classList.add("show");
}

// przejazd główki po linii z węzła fromIdx do toIdx (kolejne lokacje)
function travelAvatar(fromIdx, toIdx) {
  const svg = document.getElementById("worldmap-paths");
  const av = document.getElementById("map-avatar");
  const segIdx = Math.min(fromIdx, toIdx);
  const seg = svg.children[segIdx];
  if (!seg || !av || !seg.getTotalLength) return;
  const len = seg.getTotalLength();
  const forward = toIdx > fromIdx;
  // ustaw na starcie (bez mignięcia)
  const s = seg.getPointAtLength(forward ? 0 : len);
  av.style.left = s.x + "%";
  av.style.top = s.y + "%";
  av.classList.add("show");

  const dur = 1700;
  let start = null;
  function frame(ts) {
    if (start === null) start = ts;
    const t = Math.min((ts - start) / dur, 1);
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOut
    const at = forward ? ease : 1 - ease;
    const pt = seg.getPointAtLength(at * len);
    av.style.left = pt.x + "%";
    av.style.top = pt.y + "%";
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------- OTWIERANIE LOKACJI ---------- */
function openLocation(i) {
  const map = MAPS[currentMapId];
  const loc = map.locations[i];
  activeIndex = i;

  if (loc.game === "submap") {
    // przejście na inną mapę (np. Polska)
    setMap(loc.submap);
    renderMap();
    showScreen("map");
    return;
  }
  if (loc.game === "final") {
    app.progress = Math.max(app.progress, map.locations.length);
    showFinal();
    return;
  }

  showScreen("game");
  GAMES[loc.game](gameContent, loc, {
    onWin: () => handleWin(i),
    onLose: () => handleLose(i),
  });

  // karuzela zdjęć w tle gry (jeśli lokacja ma listę bg)
  // dodawana do #game-screen (pełna szerokość), pod treść gry — bezpieczne dla iOS Safari
  const gameScreen = document.getElementById("game-screen");
  gameScreen.querySelectorAll(".bg-carousel, .bg-static").forEach((e) => e.remove());
  if (loc.bg && loc.bg.length) {
    const imgs = loc.bg.map((src) => `<img src="${src}" alt="" />`).join("");
    const carousel = document.createElement("div");
    carousel.className = "bg-carousel";
    carousel.setAttribute("aria-hidden", "true");
    carousel.innerHTML = `<div class="bg-track">${imgs}${imgs}${imgs}</div>`;
    gameScreen.appendChild(carousel);
  } else if (loc.bgImage) {
    // statyczne zdjęcie jako tło gry (np. Jordania)
    const bg = document.createElement("div");
    bg.className = "bg-static";
    bg.setAttribute("aria-hidden", "true");
    bg.style.backgroundImage = `url("${loc.bgImage}")`;
    gameScreen.appendChild(bg);
  }
}

function handleWin(i) {
  const map = MAPS[currentMapId];
  if (i + 1 > app.progress) app.progress = i + 1;
  const loc = map.locations[i];

  // PIĆ STOP itp. — bez okienka wygranej, od razu na mapę i główka jedzie dalej
  if (loc.noWinModal) {
    renderMap();
    showScreen("map");
    travelAvatar(i, i + 1);
    return;
  }

  fireConfetti();

  // dźwięk wygranej (z win-wideo) + ścisz muzykę
  const winAudio = document.getElementById("win-audio");
  duckMusic();
  try {
    winAudio.currentTime = 0;
    winAudio.muted = false;
    winAudio.volume = 1.0;
    const wp = winAudio.play();
    if (wp && wp.catch) wp.catch(() => {});
  } catch (e) {}
  winAudio.onended = () => unduckMusic();

  const isLastGame = i + 1 >= map.locations.length - 1; // ostatnia gra przed finałem/submapą
  const finalName = map.locations[map.locations.length - 1].name;
  const w = loc.win || {};
  const title = w.title || rand(CONFIG.winLines);
  const text =
    w.text != null
      ? w.text
      : isLastGame
      ? "To była ostatnia próba! Wróć na mapę i kliknij " + finalName
      : "Lokacja odblokowana — ruszaj dalej!";
  showModal({
    type: "win",
    title,
    text,
    photo: w.photo || CONFIG.photos.win,
    phText: "Tu pojawi się zdjęcie kolegi (wygrana)",
    btn: loc.final ? "ODBIERZ PREZENT 🎁" : "Dalej ➜",
    onClose: () => {
      try { winAudio.pause(); } catch (e) {}
      unduckMusic();
      if (loc.final) {
        showFinal();
      } else {
        renderMap();
        showScreen("map");
        travelAvatar(i, i + 1); // główka idzie po linii do kolejnej lokacji
      }
    },
  });
}

function handleLose(i) {
  showGameOver(i); // nagranie + wybuchający GAME OVER + spróbuj ponownie
}

/* ---------- GAME OVER (po błędnej odpowiedzi) ---------- */
// jednorazowe nadpisanie zdjęcia Game Over (np. 2. pytanie Warszawy/Hiszpanii)
let gameoverOverride = null;
function setGameoverOverride(src) { gameoverOverride = src; }

function showGameOver(i) {
  const ov = document.getElementById("gameover");
  const vid = document.getElementById("gameover-video");
  const img = document.getElementById("gameover-image");
  const aud = document.getElementById("gameover-audio");
  const txt = document.getElementById("gameover-text");
  const loc = MAPS[currentMapId].locations[i];
  const goImg = gameoverOverride || (loc && loc.gameover);
  gameoverOverride = null;

  ov.classList.add("show");
  duckMusic(); // ścisz muzykę na czas Game Over

  if (goImg) {
    // własne zdjęcie Game Over + dźwięk z nagrania GAME OVER (osobny element audio)
    img.src = goImg;
    img.style.display = "block";
    vid.style.display = "none";
    try { vid.pause(); } catch (e) {}
    try {
      aud.currentTime = 0;
      aud.muted = false;
      aud.volume = 1.0;
      const p = aud.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  } else {
    try { aud.pause(); } catch (e) {}
    img.style.display = "none";
    vid.style.display = "block";
    try {
      vid.currentTime = 0;
      vid.muted = false;
      vid.volume = 1.0; // maksymalna głośność
      const p = vid.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }

  // ponów animację „wybuchu"
  txt.classList.remove("boom");
  void txt.offsetWidth; // wymuś reflow, by animacja zagrała od nowa
  txt.classList.add("boom");

  document.getElementById("gameover-btn").onclick = () => {
    ov.classList.remove("show");
    try { vid.pause(); } catch (e) {}
    try { aud.pause(); } catch (e) {}
    unduckMusic(); // przywróć głośność muzyki
    openLocation(i); // restart tej samej gry
  };
}

/* ---------- ODTWARZACZ NAGRAŃ (pełny ekran) ---------- */
let videoOnDone = null;
function openVideo(src, onDone) {
  videoOnDone = onDone || null;
  const ov = document.getElementById("video-overlay");
  const pl = document.getElementById("video-player");
  ov.classList.add("show");
  duckMusic();
  try {
    pl.src = src;
    pl.currentTime = 0;
    pl.muted = false;
    pl.volume = 1.0;
    const p = pl.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) {}
}
function closeVideo() {
  const ov = document.getElementById("video-overlay");
  const pl = document.getElementById("video-player");
  try { pl.pause(); } catch (e) {}
  ov.classList.remove("show");
  unduckMusic();
  const done = videoOnDone;
  videoOnDone = null;
  if (done) done(); // np. PIĆ STOP: po nagraniu jedziemy dalej
}
document.getElementById("video-close").addEventListener("click", closeVideo);
document.getElementById("video-player").addEventListener("ended", closeVideo);

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
  const tel = f.phone.replace(/\s/g, "");
  screens.final.innerHTML = `
    <div class="final-inner">
      <div class="final-trophy">🏆</div>
      <h1 class="final-title">${f.title}</h1>
      <p class="final-msg">${f.message.replace(/\n/g, "<br>")}</p>
      <div class="final-card">
        <div class="final-gift">${f.gift}</div>
        <div class="label" style="margin-top:14px">${f.phoneLabel}</div>
        <a class="final-phone" href="tel:${tel}">${f.phone}</a>
        <a class="btn btn-gold final-claim" href="tel:${tel}">📞 ODBIERZ NAGRODĘ</a>
      </div>
      <button class="btn btn-ghost" id="final-map">← Wróć na mapę</button>
    </div>`;

  // przewijane zdjęcia w tle nagrody
  if (f.bg && f.bg.length) {
    const imgs = f.bg.map((src) => `<img src="${src}" alt="" />`).join("");
    const carousel = document.createElement("div");
    carousel.className = "bg-carousel";
    carousel.setAttribute("aria-hidden", "true");
    carousel.innerHTML = `<div class="bg-track">${imgs}${imgs}${imgs}</div>`;
    screens.final.appendChild(carousel);
  }

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

/* ---------- MUZYKA W TLE ---------- */
// plik MP3 ma już wypalone 25% głośności (dla iPhone, gdzie JS nie steruje volume).
// volume=1.0 => słyszalne 25%; duck 0.2 => słyszalne ~5% (działa na desktop/Mac).
const BG_MUSIC_VOL = 1.0,
  BG_MUSIC_DUCK = 0.2;
const bgMusic = document.getElementById("bg-music");
bgMusic.volume = BG_MUSIC_VOL;
function startMusic() {
  bgMusic.volume = BG_MUSIC_VOL;
  const p = bgMusic.play();
  if (p && p.catch) p.catch(() => {});
}
function duckMusic() {
  bgMusic.volume = BG_MUSIC_DUCK;
}
function unduckMusic() {
  bgMusic.volume = BG_MUSIC_VOL;
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
  // popup co minutę czeka, gdy otwarty jest modal, Game Over LUB gra nagranie
  return (
    document.getElementById("modal").classList.contains("show") ||
    document.getElementById("gameover").classList.contains("show") ||
    document.getElementById("video-overlay").classList.contains("show")
  );
}
// kolejka zdjęć PIJE: przetasowana, bez powtórek; gdy się skończy — tasujemy od nowa (zapętlenie)
let drinkQueue = [];
function nextDrinkPhoto() {
  const pool = CONFIG.drink.photos || [];
  if (!pool.length) return CONFIG.photos.drink;
  if (!drinkQueue.length) {
    drinkQueue = pool.slice();
    for (let i = drinkQueue.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [drinkQueue[i], drinkQueue[j]] = [drinkQueue[j], drinkQueue[i]];
    }
  }
  return drinkQueue.shift();
}
function showDrink() {
  const da = document.getElementById("drink-audio");
  duckMusic();
  try {
    da.currentTime = 0;
    da.muted = false;
    da.volume = 1.0;
    const p = da.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) {}
  da.onended = () => unduckMusic();
  showModal({
    type: "drink",
    title: CONFIG.drink.title,
    text: CONFIG.drink.text,
    photo: nextDrinkPhoto(),
    phText: "🍻",
    btn: CONFIG.drink.btn,
    onClose: () => {
      try { da.pause(); } catch (e) {}
      unduckMusic();
    },
  });
}

/* ---------- PRZYCISKI GLOBALNE ---------- */
document.getElementById("reset-btn").addEventListener("click", () => {
  if (confirm("Zrestartować całą grę? Postęp zostanie skasowany.")) {
    Object.values(MAPS).forEach((m) => localStorage.removeItem(m.storeKey));
    localStorage.removeItem(MAP_ID_KEY);
    currentMapId = "world";
    resetTimer();
    try { bgMusic.pause(); bgMusic.currentTime = 0; } catch (e) {}
    showGate();
  }
});

// brama: wybór GRAM / PASS
document.getElementById("gate-gram").addEventListener("click", () => {
  // odblokuj audio nagrania w geście użytkownika (Safari/iOS) — gra bez dźwięku,
  // ale „rozgrzewa" element, by późniejsze play() z dźwiękiem było dozwolone
  const vid = document.getElementById("gameover-video");
  const aud = document.getElementById("gameover-audio");
  try {
    vid.muted = false;
    vid.volume = 0; // bez słyszalnego dźwięku przy odblokowaniu
    vid.play().then(() => { vid.pause(); vid.currentTime = 0; }).catch(() => {});
  } catch (e) {}
  try {
    aud.muted = false;
    aud.volume = 0;
    aud.play().then(() => { aud.pause(); aud.currentTime = 0; }).catch(() => {});
  } catch (e) {}
  const winAud = document.getElementById("win-audio");
  try {
    winAud.muted = false;
    winAud.volume = 0;
    winAud.play().then(() => { winAud.pause(); winAud.currentTime = 0; }).catch(() => {});
  } catch (e) {}
  const drinkAud = document.getElementById("drink-audio");
  try {
    drinkAud.muted = false;
    drinkAud.volume = 0;
    drinkAud.play().then(() => { drinkAud.pause(); drinkAud.currentTime = 0; }).catch(() => {});
  } catch (e) {}
  // wstępne wczytanie zdjęć PIJE (popup co minutę) — żeby zawsze były gotowe
  (CONFIG.drink.photos || []).forEach((src) => { const im = new Image(); im.src = src; });
  startMusic(); // muzyka w tle startuje w geście użytkownika
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
// powrót z mapy Polski na mapę świata
document.getElementById("world-back-btn").addEventListener("click", () => {
  setMap("world");
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
