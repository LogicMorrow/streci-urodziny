/* =====================================================================
   GRY — każda funkcja dostaje (el, loc, cb)
   el  = kontener #game-content
   loc = obiekt lokacji z config.js
   cb  = { onWin(), onLose() }
   ===================================================================== */

// --- pomocnicze flagi (SVG -> data URI) ---
const FLAGS = {
  hiszpania:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 40'><rect width='60' height='40' fill='#c60b1e'/><rect y='10' width='60' height='20' fill='#ffc400'/></svg>"
    ),
  dania:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 40'><rect width='60' height='40' fill='#c8102e'/><rect x='16' width='6' height='40' fill='#fff'/><rect y='17' width='60' height='6' fill='#fff'/></svg>"
    ),
  francja:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 40'><rect width='20' height='40' fill='#0055A4'/><rect x='20' width='20' height='40' fill='#fff'/><rect x='40' width='20' height='40' fill='#EF4135'/></svg>"
    ),
  lgbt:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 40'><rect width='60' height='6.67' y='0' fill='#e40303'/><rect width='60' height='6.67' y='6.67' fill='#ff8c00'/><rect width='60' height='6.67' y='13.33' fill='#ffed00'/><rect width='60' height='6.67' y='20' fill='#008026'/><rect width='60' height='6.67' y='26.67' fill='#004dff'/><rect width='60' height='6.67' y='33.33' fill='#750787'/></svg>"
    ),
  izrael:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 40'><rect width='60' height='40' fill='#fff'/><rect y='6' width='60' height='4' fill='#0038b8'/><rect y='30' width='60' height='4' fill='#0038b8'/><polygon points='30,11 37,24 23,24' fill='none' stroke='#0038b8' stroke-width='1.6'/><polygon points='30,29 23,16 37,16' fill='none' stroke='#0038b8' stroke-width='1.6'/></svg>"
    ),
};

function gameHeader(loc) {
  return `<div class="game-flag">${loc.emoji}</div>
          <h2 class="game-title">${loc.title}</h2>
          <p class="game-desc">${loc.desc}</p>`;
}

/* ================= GRA 1: KAPELUSZE / PIWO CORONA ================= */
function gameCups(el, loc, cb) {
  // pasek zdjęć przewijający się w tle na dole ekranu
  const mexImgs = ["01", "02", "03", "04"]
    .map((n) => `<img src="assets/photos/MEKSYK/${n}.jpeg" alt="" />`)
    .join("");

  el.innerHTML =
    gameHeader(loc) +
    `<div class="cups-status" id="cups-status">Naciśnij „Wymieszaj"</div>
     <div class="cups-stage" id="stage"></div>
     <button class="btn btn-gold" id="cups-start">▶ Wymieszaj</button>
     <div class="mex-strip" aria-hidden="true"><div class="mex-track">${mexImgs}${mexImgs}</div></div>`;

  const stage = el.querySelector("#stage");
  const status = el.querySelector("#cups-status");
  const startBtn = el.querySelector("#cups-start");

  const SLOT_LEFT = [0, 34.5, 69]; // % dla 3 slotów
  let slotOf = [0, 1, 2]; // slotOf[hat] = slot
  let beerHat = Math.floor(Math.random() * 3);
  let busy = true;

  const hats = SLOT_LEFT.map((_, i) => {
    const h = document.createElement("div");
    h.className = "hat";
    h.dataset.hat = i;
    h.innerHTML = `<img class="beer" src="assets/photos/corona.png" alt="Corona" /><img class="hat-img" src="assets/photos/kapelusz.png" alt="kapelusz" />`;
    stage.appendChild(h);
    return h;
  });

  function place() {
    hats.forEach((h, i) => (h.style.left = SLOT_LEFT[slotOf[i]] + "%"));
  }
  place();

  function setBusy(b) {
    busy = b;
    hats.forEach((h) => (h.style.pointerEvents = b ? "none" : "auto"));
  }

  function reveal() {
    // pokaż piwo pod właściwym kapeluszem
    hats[beerHat].classList.add("lift", "reveal");
    status.textContent = "Zapamiętaj!";
    setTimeout(() => {
      hats[beerHat].classList.remove("lift", "reveal");
      shuffle();
    }, 1300);
  }

  function shuffle() {
    status.textContent = "Mieszam...";
    const swaps = 7;
    let n = 0;
    const step = () => {
      if (n >= swaps) {
        status.textContent = "Gdzie jest piwo? Wskaż kapelusz!";
        setBusy(false);
        return;
      }
      let a = Math.floor(Math.random() * 3);
      let b = Math.floor(Math.random() * 3);
      while (b === a) b = Math.floor(Math.random() * 3);
      const tmp = slotOf[a];
      slotOf[a] = slotOf[b];
      slotOf[b] = tmp;
      place();
      n++;
      setTimeout(step, 480);
    };
    step();
  }

  hats.forEach((h) => {
    h.addEventListener("click", () => {
      if (busy) return;
      setBusy(true);
      const hatIdx = +h.dataset.hat;
      h.classList.add("lift");
      if (hatIdx === beerHat) {
        h.classList.add("reveal");
        setTimeout(cb.onWin, 700);
      } else {
        hats[beerHat].classList.add("lift", "reveal"); // pokaż gdzie było
        setTimeout(cb.onLose, 900);
      }
    });
  });

  startBtn.addEventListener("click", () => {
    startBtn.style.display = "none";
    reveal();
  });
}

/* ================= GRA 2: JAKI JEST MANCHESTER ================= */
function gameManchester(el, loc, cb) {
  el.innerHTML =
    gameHeader(loc) +
    `<div class="mc-prompt" id="mc-prompt"></div>
     <div class="mc-cards">
       <button class="mc-card red" id="mc-red">
         <img src="assets/photos/logo-manunited.png" alt="Manchester United" />
         <span class="mc-label">THE RED</span>
       </button>
       <button class="mc-card blue" id="mc-blue">
         <img src="assets/photos/MAN-CITY.png" alt="Manchester City" />
         <span class="mc-label">THE BLUE</span>
       </button>
     </div>`;

  const prompt = el.querySelector("#mc-prompt");
  const red = el.querySelector("#mc-red");
  const blue = el.querySelector("#mc-blue");
  let redClicks = 0;

  // The Blue (Man City) = od razu Game Over
  blue.addEventListener("click", cb.onLose);

  // The Red (Man United) = poprawna, ale dopiero za 2. kliknięciem
  red.addEventListener("click", () => {
    redClicks++;
    if (redClicks === 1) {
      prompt.textContent = "NA PEWNO?";
      prompt.classList.remove("show");
      void prompt.offsetWidth; // restart animacji
      prompt.classList.add("show");
    } else {
      cb.onWin();
    }
  });
}

/* ================= GRA 3: FLAGA ALICANTE ================= */
function gameAlicante(el, loc, cb) {
  el.innerHTML =
    `<div class="game-flag">🇪🇸</div>
     <p class="game-desc" style="margin-bottom:8px">Alicante leży w Hiszpanii. Flaga Hiszpanii wygląda tak:</p>
     <img class="ref-flag" src="${FLAGS.hiszpania}" alt="flaga Hiszpanii" />
     <h2 class="game-title" style="margin-top:14px">A jak wygląda prawdziwa flaga ALICANTE?</h2>
     <div class="flag-choices">
       <button class="flag-choice" data-correct="0"><img src="${FLAGS.lgbt}" alt="Flaga A"/></button>
       <button class="flag-choice" data-correct="1"><img src="${FLAGS.dania}" alt="Flaga B"/></button>
       <button class="flag-choice" data-correct="0"><img src="${FLAGS.izrael}" alt="Flaga C"/></button>
     </div>`;

  el.querySelectorAll(".flag-choice").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.correct === "1") cb.onWin();
      else cb.onLose();
    });
  });
}

/* ================= GRA 4: RYSOWANIE DROGI PALCEM ================= */
function gameDraw(el, loc, cb) {
  el.innerHTML =
    gameHeader(loc) +
    `<div class="draw-wrap">
       <canvas id="draw-canvas"></canvas>
     </div>
     <p class="draw-hint">Zacznij od zielonego punktu (START) i dojedź do złotego (META) nie odrywając palca.</p>
     <div class="btn-row"><button class="btn btn-ghost" id="draw-clear">Wyczyść</button></div>`;

  const canvas = el.querySelector("#draw-canvas");
  const ctx = canvas.getContext("2d");
  let start, end;
  let drawing = false,
    startedOk = false,
    last = null;

  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = r.width * dpr;
    canvas.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    start = { x: 40, y: r.height - 40 };
    end = { x: r.width - 40, y: 40 };
    redraw();
  }
  function dot(p, color, label) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.font = "bold 10px Poppins, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, p.x, p.y);
  }
  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dot(start, "#21c46b", "START");
    dot(end, "#FBE122", "META");
  }
  function near(p, t, d = 40) {
    return Math.hypot(p.x - t.x, p.y - t.y) < d;
  }
  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  canvas.addEventListener("pointerdown", (e) => {
    const p = pos(e);
    startedOk = near(p, start);
    drawing = true;
    last = p;
    ctx.strokeStyle = "#FBE122";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p;
  });
  function finish() {
    if (!drawing) return;
    drawing = false;
    if (startedOk && last && near(last, end)) cb.onWin();
    else cb.onLose();
  }
  canvas.addEventListener("pointerup", finish);
  canvas.addEventListener("pointerleave", finish);
  el.querySelector("#draw-clear").addEventListener("click", redraw);

  window.addEventListener("resize", resize);
  setTimeout(resize, 30);
}

/* ================= QUIZ ZE ZDJĘCIAMI (np. Maroko) ================= */
function gamePhotoQuiz(el, loc, cb) {
  const opts = loc.options || [];
  el.innerHTML =
    gameHeader(loc) +
    `<div class="photo-choices">` +
    opts
      .map(
        (o) =>
          `<button class="photo-choice" data-correct="${o.correct ? 1 : 0}">
             <img src="${o.img}" alt="${o.label}" />
             <span class="photo-choice-label">${o.label}</span>
           </button>`
      )
      .join("") +
    `</div>`;

  el.querySelectorAll(".photo-choice").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.correct === "1") cb.onWin();
      else cb.onLose();
    });
  });
}

/* ================= QUIZ Z NAGRANIEM (np. Indonezja) ================= */
function gameVideoQuiz(el, loc, cb) {
  const opts = loc.options || [];
  el.innerHTML =
    gameHeader(loc) +
    `<video class="quiz-video" controls playsinline preload="metadata">
       <source src="${loc.video}" type="video/mp4" />
     </video>
     <div class="quiz-opts">` +
    opts
      .map(
        (o) =>
          `<button class="quiz-opt" data-correct="${o.correct ? 1 : 0}">${o.label}</button>`
      )
      .join("") +
    `</div>`;

  el.querySelectorAll(".quiz-opt").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.correct === "1") cb.onWin();
      else cb.onLose();
    });
  });
}

/* ================= SLOT: GRA W PRZYGOTOWANIU ================= */
function gamePlaceholder(el, loc, cb) {
  el.innerHTML =
    gameHeader(loc) +
    `<div class="btn-row">
       <button class="btn btn-primary" id="ph-next">Przejdź dalej ➜</button>
     </div>`;
  el.querySelector("#ph-next").addEventListener("click", cb.onWin);
}

const GAMES = {
  cups: gameCups,
  manchester: gameManchester,
  alicante: gameAlicante,
  photoquiz: gamePhotoQuiz,
  videoquiz: gameVideoQuiz,
  draw: gameDraw,
  placeholder: gamePlaceholder,
};
