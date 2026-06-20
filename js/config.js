/* =====================================================================
   KONFIGURACJA — TUTAJ PODMIENIASZ WSZYSTKO CO TWOJE
   (imię kolegi, numer telefonu, teksty, nazwy plików ze zdjęciami)
   ===================================================================== */

const CONFIG = {
  // Nazwa gry (nagłówek + tytuł karty przeglądarki)
  gameName: "STRENCI PIERWSZY WE WSZYSTKO",

  // Imię solenizanta (wstawiane w tekstach)
  friendName: "Kolego",

  // ---- POPUP CO MINUTĘ ----
  drink: {
    title: "PRZYSZEDŁ CZAS ZROBIĆ TO CO STRENCI ZE ZDJĘCIA",
    text: "",
    btn: "ZDROWIE",
    photos: [
      "assets/photos/PIJE/01.webp",
      "assets/photos/PIJE/02.webp",
      "assets/photos/PIJE/03.webp",
      "assets/photos/PIJE/04.webp",
      "assets/photos/PIJE/05.webp",
      "assets/photos/PIJE/06.webp",
    ],
  },

  // ---- EKRAN STARTOWY (brama) ----
  gate: {
    question: "Grasz czy Pass?",
    gramLabel: "GRAM",
    passLabel: "PASS",
    passTitle: "NIE PENIAJ",
    passText: "Nie ma zmiłuj — klikasz GRAM i lecimy! 😎",
    passBtn: "No dobra…",
  },

  // ---- FINAŁ (nagroda za ukończenie całej gry) ----
  final: {
    title: "ODBIERZ NAGRODĘ 🎁",
    message: "Za wszystkie dobrze zrobione zadania należy Ci się nagroda:",
    gift: "🎸 Jedna lekcja gry na gitarze",
    phoneLabel: "Zadzwoń i umów się:",
    phone: "516 515 825",
    bg: [
      "assets/photos/NAGRODA/01.webp",
      "assets/photos/NAGRODA/02.webp",
      "assets/photos/NAGRODA/03.webp",
      "assets/photos/NAGRODA/04.webp",
      "assets/photos/NAGRODA/05.webp",
    ],
  },

  /* ---- ZDJĘCIA ----
     Wrzuć pliki .jpg do folderu  assets/photos/  pod tymi nazwami.
     Dopóki plik nie istnieje, pokaże się placeholder z opisem.
     Możesz użyć jednego zdjęcia do wszystkiego — wpisz tę samą nazwę.   */
  photos: {
    gram:  "assets/photos/GRAM.webp",      // lewy kafelek na ekranie startowym (GRAM)
    pass:  "assets/photos/PASS.webp",      // prawy kafelek na ekranie startowym (PASS)
    win:   "assets/photos/wygrana.webp",    // zdjęcie po wygranej
    lose:  "assets/photos/przegrana.webp",  // zdjęcie po przegranej
    final: "assets/photos/final.webp",      // zdjęcie w finale (okrągłe)
    drink: "assets/photos/drink.webp",      // popup „Czas na drina!" co minutę
  },

  // Teksty gratulacji (losowane po każdej wygranej)
  winLines: [
    "Brawo! Lokacja odblokowana 🔓",
    "Mistrzostwo! Lecimy dalej ✈️",
    "Tak się to robi! 🔥",
  ],
  // Teksty po przegranej
  loseLines: [
    "Tym razem nie wyszło 😅 Spróbuj jeszcze raz!",
    "Blisko! Dasz radę — kolejna próba 💪",
    "Ups! Pudło. Próbuj dalej!",
  ],
};

/* =====================================================================
   MAPY I LOKACJE
   game: 'cups'|'manchester'|'alicante'|'photoquiz'|'videoquiz'
         |'placeholder'|'submap'|'final'
   lat/lon = prawdziwe współrzędne (pin ląduje w realnym miejscu).
   'submap' = kliknięcie przenosi na inną mapę (pole submap: 'poland').
   ===================================================================== */

// --- MAPA ŚWIATA ---
const WORLD_LOCATIONS = [
  { id: "meksyk",    name: "Meksyk",    emoji: "🇲🇽", lat: 19.4,  lon: -99.1, game: "cups",
    title: "Pod którym kapeluszem ukrył się ulubiony napój Strenci9?", desc: "Obserwuj uważnie 👀",
    bg: ["assets/photos/MEKSYK/01.webp", "assets/photos/MEKSYK/02.webp", "assets/photos/MEKSYK/03.webp", "assets/photos/MEKSYK/04.webp"],
    win: { title: "DOBRZE!", text: "Ale coronki to bym się napił...", photo: "assets/photos/MEKSYK/meksyk-win.webp" } },
  { id: "picstop1",  name: "Pić Stop",  emoji: "⛽", lat: 40.0,  lon: -45.0, game: "pitstop", noWinModal: true,
    title: "PIĆ STOP", desc: "To długa podróż — trzeba zatankować! ⛽",
    video: "assets/video/przerwa-w-podrozy.mp4" },
  { id: "anglia",    name: "Anglia",    emoji: "🏴", lat: 53.5,  lon: -2.2,  game: "manchester",
    title: "JAKI JEST MANCHESTER?", desc: "",
    bg: ["assets/photos/ANGLIA/01.webp", "assets/photos/ANGLIA/02.webp", "assets/photos/ANGLIA/03.webp", "assets/photos/ANGLIA/04.webp", "assets/photos/ANGLIA/05.webp", "assets/photos/ANGLIA/06.webp", "assets/photos/ANGLIA/07.webp", "assets/photos/ANGLIA/08.webp"],
    gameover: "assets/photos/ANGLIA-GAMEOVER.webp",
    win: { title: "DOBRZE!", text: "Może nie w tabeli, ale w sercu zawsze na pierwszym.", photo: "assets/photos/ANGLIA-WIN.webp" } },
  { id: "hiszpania", name: "Hiszpania", emoji: "🇪🇸", lat: 38.35, lon: -0.48, game: "hiszpania",
    title: "Flaga Alicante", desc: "",
    bg: ["assets/photos/HISZPANIA/01.webp", "assets/photos/HISZPANIA/02.webp", "assets/photos/HISZPANIA/03.webp", "assets/photos/HISZPANIA/04.webp"],
    q1win: { title: "KMWTW", photo: "assets/photos/HISZPANIA-WIN.webp" }, // popup po 1. pytaniu
    q2: {
      title: "JAKIEGO UTWORU SŁUCHA STRENCI NA TYM ZDJĘCIU?",
      image: "assets/photos/HISZPANIA/pytanie2.webp",
      options: [
        { label: "DIRTY DIANA",    correct: false },
        { label: "FENDI",          correct: true  },
        { label: "WIECZNIE",       correct: false },
        { label: "ZWARIOWANA NOC", correct: false },
      ],
    },
    gameover: "assets/photos/HISZPANIA/gameover2.webp",
    win: { title: "DOBRZE!", text: "", photo: "assets/photos/HISZPANIA/win2.webp" } },
  { id: "maroko",    name: "Maroko",    emoji: "🇲🇦", lat: 33.6,  lon: -7.6,  game: "photoquiz",
    title: "Który ptak ma w zwyczaju wyjebać się na znajomych?", desc: "",
    bg: ["assets/photos/MAROKO/01.webp", "assets/photos/MAROKO/02.webp", "assets/photos/MAROKO/03.webp", "assets/photos/MAROKO/04.webp"],
    options: [
      { img: "assets/photos/KACZKA.webp", label: "KACZKA", correct: false },
      { img: "assets/photos/BOCIAN.webp", label: "BOCIAN", correct: false },
      { img: "assets/photos/SOKOL.webp",  label: "SOKÓŁ",  correct: true  },
    ],
    win: { title: "HARK STFU", text: "", photo: "assets/photos/MAROKO/maroko-win.webp" } },
  { id: "jordania",  name: "Jordania",  emoji: "🇯🇴", lat: 31.95, lon: 35.93, game: "choice",
    title: "PODRYW NA SPANIE W NAMIOCIE: KLASA CZY OBCIACH?", desc: "",
    bgImage: "assets/photos/JORDANIA/Jordania-glowne.webp",
    options: [
      { label: "KLASA",   correct: true  },
      { label: "OBCIACH", correct: false },
    ],
    gameover: "assets/photos/JORDANIA/JORDANIA-GAMEOVER.webp",
    win: { title: "KLASA!", text: "", photo: "assets/photos/JORDANIA/Jordania-win.webp" } },
  { id: "picstop",   name: "Pić Stop",  emoji: "⛽", lat: 17.0,  lon: 72.0,  game: "pitstop", noWinModal: true,
    title: "PIĆ STOP", desc: "To daleka droga — trzeba zatankować! ⛽",
    video: "assets/video/pic-stop.mp4" },
  { id: "indonezja", name: "Indonezja", emoji: "🇮🇩", lat: -6.2,  lon: 106.8, game: "videoquiz",
    title: "ILE PROMILI NA TYM NAGRANIU MA STRENCI?", desc: "Kliknij ▶, obejrzyj i zaznacz odpowiedź",
    video: "assets/video/nagranie-indonezja.mp4",
    bg: ["assets/photos/INDONEZJA/01.webp", "assets/photos/INDONEZJA/02.webp", "assets/photos/INDONEZJA/03.webp", "assets/photos/INDONEZJA/04.webp"],
    gameover: "assets/photos/INDONEZJA/game-over.webp", // zamiast standardowego nagrania Game Over
    options: [
      { label: "1,5 PROMILA", correct: false },
      { label: "2 PROMILE",   correct: false },
      { label: "WSZYSTKIE",   correct: true  },
    ],
    win: { title: "LECIMY DALEJ", text: "tak jak Strenci leciał z melanżem w Azji 🍻", photo: "assets/photos/INDONEZJA/win.webp" } },
  { id: "wietnam",   name: "Wietnam",   emoji: "🇻🇳", lat: 16.0,  lon: 108.0, game: "videoquiz",
    title: "ZADANIE DLA WSZYSTKICH", desc: "",
    video: "assets/video/nagranie-wietnam.mp4",
    bg: ["assets/photos/WIETNAM/01.webp", "assets/photos/WIETNAM/02.webp", "assets/photos/WIETNAM/03.webp"],
    caption: "TERAZ KAŻDY KTO TO OGLĄDA ROBI ZE SWOIM DRINEM TO CO STRENCI Z KIELISZKIEM",
    options: [
      { label: "W POKOJU SĄ MIĘCZAKI", correct: false },
      { label: "LEJ NASTĘPNY",         correct: true  },
    ],
    gameover: "assets/photos/WIETNAM/gameover.webp",
    win: { title: "LEJ NASTĘPNY!", text: "", photo: "assets/photos/WIN-Wietnam.webp" } },
  { id: "polska",    name: "Polska",    emoji: "🇵🇱", lat: 52.2,  lon: 21.0,  game: "submap", submap: "poland",
    title: "Dom!", desc: "Wróciłeś do Polski — czas na finał!" },
];

// --- MAPA POLSKI (odblokowuje się po dotarciu do Polski; Warszawa = finał) ---
const POLAND_LOCATIONS = [
  { id: "zamosc",   name: "Zamość",   emoji: "🏰", lat: 50.72, lon: 23.25, game: "choice",
    title: "NA JAKIE DNI STRENCI BYŁ NAJBARDZIEJ NAJEBANY?", desc: "",
    bg: ["assets/photos/ZAMOSC/00.webp", "assets/photos/ZAMOSC/01.webp", "assets/photos/ZAMOSC/02.webp", "assets/photos/ZAMOSC/03.webp", "assets/photos/ZAMOSC/04.webp", "assets/photos/ZAMOSC/05.webp", "assets/photos/ZAMOSC/06.webp", "assets/photos/ZAMOSC/07.webp", "assets/photos/ZAMOSC/08.webp", "assets/photos/ZAMOSC/09.webp"],
    options: [
      { label: "DNI WALENIA KONIA", correct: false },
      { label: "DNI PŁODNE",        correct: false },
      { label: "DNI KRASNOBRODU",   correct: true  },
    ],
    gameover: "assets/photos/ZAMOSC/gameover.webp",
    win: { title: "NIECH KAŻDY KOŃCZY DZISIAJ TAK SAMO!", text: "", photo: "assets/photos/ZAMOSC/win.webp" } },
  { id: "krakow",   name: "Kraków",   emoji: "🐉", lat: 50.06, lon: 19.94, game: "choice",
    title: "O KTÓREJ GODZINIE NA SZTYWNO BYŁO UMÓWIONE DO KLUBU SHEIN W KRAKOWIE?", desc: "",
    bg: ["assets/photos/KRAKOW/01.webp", "assets/photos/KRAKOW/02.webp", "assets/photos/KRAKOW/03.webp", "assets/photos/KRAKOW/04.webp"],
    options: [
      { label: "22:00", correct: false },
      { label: "22:30", correct: true  },
      { label: "23:00", correct: false },
      { label: "00:00", correct: false },
    ],
    gameover: "assets/photos/KRAKOW/GAME-OVER.webp",
    win: { title: "BRAWO!", text: "Teraz każdy musi się napić, sztywniutko! 🍻", photo: "assets/photos/KRAKOW/WIN.webp" } },
  { id: "warszawa", name: "Warszawa", emoji: "🧜", lat: 52.23, lon: 21.01, game: "warszawa", final: true,
    title: "KTÓRY Z TWOICH KOLEGÓW POKONAŁ CHO'GATHA NA WARSZAWSKIEJ DOMÓWCE?", desc: "",
    bg: ["assets/photos/WARSZAWA/01.webp", "assets/photos/WARSZAWA/02.webp", "assets/photos/WARSZAWA/03.webp", "assets/photos/WARSZAWA/04.webp"],
    options: [
      { img: "assets/photos/WARSZAWA/odpowiedzi/Godzisz.webp", label: "BG",     correct: true  },
      { img: "assets/photos/WARSZAWA/odpowiedzi/Many.webp",    label: "MANY",   correct: false },
      { img: "assets/photos/WARSZAWA/odpowiedzi/Planet.webp",  label: "PLANET", correct: false },
      { img: "assets/photos/WARSZAWA/odpowiedzi/Marcin.webp",  label: "MARCIN", correct: false },
    ],
    gameover: "assets/photos/WARSZAWA/Warszawa-gameover.webp", // game over 1. pytania (bez zmian)
    q1win: { title: "DOBRZE BG", text: "gumka nie pękła", photo: "assets/photos/WARSZAWA/Warszawa-win.webp" }, // popup po 1. pytaniu
    q2: {
      title: "JAKI JEST NAJLEPSZY KEBAB W WARSZAWIE?",
      options: [
        { label: "TANTUNI",    correct: true  },
        { label: "U CIAPAKA",  correct: false },
        { label: "EFFES",      correct: false },
        { label: "KEBAB KING", correct: false },
      ],
      gameover: "assets/photos/WARSZAWA/gameover2.webp", // game over 2. pytania (nowe)
    },
    win: { title: "GRATULACJE!", text: "Przeszedłeś całą grę! Teraz każdy musi wypić do dna za zdrowie Strenciego! 🍻", photo: "assets/photos/WARSZAWA/win2.webp" } },
];

/* Mapy: każda ma własny kadr (bounds), kontur (path), klucz zapisu i listę lokacji.
   path: WORLD_PATH (worldmap.js) / POLAND_PATH (poland.js) — ładowane PRZED config.js. */
const MAPS = {
  world: {
    bounds: { lonMin: -128, lonMax: 142, latMax: 62, latMin: -8 },
    path: WORLD_PATH,
    storeKey: "podroz_progress_v1",
    locations: WORLD_LOCATIONS,
  },
  poland: {
    bounds: { lonMin: 13.5, lonMax: 25, latMax: 55.2, latMin: 48.8 },
    path: POLAND_PATH,
    storeKey: "podroz_poland_v1",
    locations: POLAND_LOCATIONS,
  },
};

// lon/lat -> pozycja % w kadrze danej mapy (do pinezek HTML)
function geoToPct(lat, lon, b) {
  return {
    left: ((lon - b.lonMin) / (b.lonMax - b.lonMin)) * 100,
    top: ((b.latMax - lat) / (b.latMax - b.latMin)) * 100,
  };
}
// kadr -> viewBox 0 0 1000 500
function mapViewBox(b) {
  const x = ((b.lonMin + 180) / 360) * 1000;
  const y = ((90 - b.latMax) / 180) * 500;
  const w = ((b.lonMax - b.lonMin) / 360) * 1000;
  const h = ((b.latMax - b.latMin) / 180) * 500;
  return `${x} ${y} ${w} ${h}`;
}
