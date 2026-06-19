/* =====================================================================
   KONFIGURACJA — TUTAJ PODMIENIASZ WSZYSTKO CO TWOJE
   (imię kolegi, numer telefonu, teksty, nazwy plików ze zdjęciami)
   ===================================================================== */

const CONFIG = {
  // Nazwa gry (nagłówek + tytuł karty przeglądarki)
  gameName: "STRĘCI PIERWSZY WE WSZYSTKO",

  // Imię solenizanta (wstawiane w tekstach)
  friendName: "Kolego",

  // ---- POPUP CO MINUTĘ ----
  drink: {
    title: "PRZYSZEDŁ CZAS ZROBIĆ TO CO STRĘCI ZE ZDJĘCIA",
    text: "",
    btn: "ZDROWIE",
    photos: [
      "assets/photos/PIJE/01.jpg",
      "assets/photos/PIJE/02.jpg",
      "assets/photos/PIJE/03.jpg",
      "assets/photos/PIJE/04.jpg",
      "assets/photos/PIJE/05.jpg",
      "assets/photos/PIJE/06.jpg",
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

  // ---- FINAŁ ----
  final: {
    title: "GRATULACJE!",
    message:
      "Przeszedłeś całą podróż dookoła świata i wróciłeś do Polski! 🇵🇱\n" +
      "To nie koniec niespodzianki — czeka na Ciebie prezent:",
    gift: "🎸 Masz wykupione 2 lekcje gry na gitarze!",
    phoneLabel: "Zadzwoń i umów termin:",
    phone: "+48 000 000 000", // <-- WSTAW PRAWDZIWY NUMER
  },

  /* ---- ZDJĘCIA ----
     Wrzuć pliki .jpg do folderu  assets/photos/  pod tymi nazwami.
     Dopóki plik nie istnieje, pokaże się placeholder z opisem.
     Możesz użyć jednego zdjęcia do wszystkiego — wpisz tę samą nazwę.   */
  photos: {
    gram:  "assets/photos/GRAM.jpeg",      // lewy kafelek na ekranie startowym (GRAM)
    pass:  "assets/photos/PASS.jpeg",      // prawy kafelek na ekranie startowym (PASS)
    win:   "assets/photos/wygrana.jpg",    // zdjęcie po wygranej
    lose:  "assets/photos/przegrana.jpg",  // zdjęcie po przegranej
    final: "assets/photos/final.jpg",      // zdjęcie w finale (okrągłe)
    drink: "assets/photos/drink.jpg",      // popup „Czas na drina!" co minutę
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

/* ---- LOKACJE / TRASA ----
   game: 'cups' | 'manchester' | 'alicante' | 'draw' | 'placeholder' | 'final'
   lat/lon = prawdziwe współrzędne (pin ląduje w realnym miejscu na mapie świata).
   Wietnam i Malezja to sloty na Twoje kolejne gry.                      */
const LOCATIONS = [
  { id: "meksyk",    name: "Meksyk",    emoji: "🇲🇽", lat: 19.4,  lon: -99.1, game: "cups",
    title: "Pod którym kapeluszem ukrył się ulubiony napój Stręci9?", desc: "Obserwuj uważnie 👀",
    win: { title: "DOBRZE!", text: "Ale coronki to bym się napił..." } },
  { id: "anglia",    name: "Anglia",    emoji: "🏴", lat: 53.5,  lon: -2.2,  game: "manchester",
    title: "JAKI JEST MANCHESTER?", desc: "",
    win: { title: "DOBRZE!", text: "Może nie w tabeli, ale w sercu zawsze na pierwszym.", photo: "assets/photos/ANGLIA-WIN.jpeg" } },
  { id: "hiszpania", name: "Hiszpania", emoji: "🇪🇸", lat: 38.35, lon: -0.48, game: "alicante",
    title: "Flaga Alicante", desc: "",
    win: { title: "KMWTW", text: "", photo: "assets/photos/HISZPANIA-WIN.jpg" } },
  { id: "maroko",    name: "Maroko",    emoji: "🇲🇦", lat: 33.6,  lon: -7.6,  game: "photoquiz",
    title: "Który ptak ma w zwyczaju wyjebać się na znajomych?", desc: "",
    options: [
      { img: "assets/photos/KACZKA.png", label: "KACZKA", correct: false },
      { img: "assets/photos/BOCIAN.png", label: "BOCIAN", correct: false },
      { img: "assets/photos/SOKOL.png",  label: "SOKÓŁ",  correct: true  },
    ],
    win: { title: "HARK STFU", text: "", photo: "assets/photos/MAROKO/maroko-win.PNG" } },
  { id: "wietnam",   name: "Wietnam",   emoji: "🇻🇳", lat: 16.0,  lon: 108.0, game: "draw",
    title: "Narysuj drogę", desc: "Przeciągnij palcem od startu do mety, nie odrywając palca." },
  { id: "indonezja", name: "Indonezja", emoji: "🇮🇩", lat: -6.2,  lon: 106.8, game: "videoquiz",
    title: "ILE PROMILI NA TYM NAGRANIU MA STRĘCI?", desc: "Kliknij ▶, obejrzyj i zaznacz odpowiedź",
    video: "assets/video/nagranie-indonezja.mp4",
    options: [
      { label: "1,5 PROMILA", correct: false },
      { label: "2 PROMILE",   correct: false },
      { label: "WSZYSTKIE",   correct: true  },
    ] },
  { id: "polska",    name: "Polska",    emoji: "🇵🇱", lat: 52.2,  lon: 21.0,  game: "final",
    title: "Dom!", desc: "Wróciłeś do Polski." },
];

/* Widoczny wycinek mapy świata (kadr) w stopniach geo.
   Mapa pełna ma viewBox 0 0 1000 500 (equirectangular).               */
const MAP_BOUNDS = { lonMin: -128, lonMax: 142, latMax: 62, latMin: -8 };

// lon/lat -> pozycja % w kadrze (do pinezek HTML)
function geoToPct(lat, lon) {
  return {
    left: ((lon - MAP_BOUNDS.lonMin) / (MAP_BOUNDS.lonMax - MAP_BOUNDS.lonMin)) * 100,
    top: ((MAP_BOUNDS.latMax - lat) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin)) * 100,
  };
}
// kadr przeliczony na układ viewBox 0 0 1000 500
function mapViewBox() {
  const x = ((MAP_BOUNDS.lonMin + 180) / 360) * 1000;
  const y = ((90 - MAP_BOUNDS.latMax) / 180) * 500;
  const w = ((MAP_BOUNDS.lonMax - MAP_BOUNDS.lonMin) / 360) * 1000;
  const h = ((MAP_BOUNDS.latMax - MAP_BOUNDS.latMin) / 180) * 500;
  return `${x} ${y} ${w} ${h}`;
}
