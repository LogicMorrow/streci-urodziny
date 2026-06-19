# 🎁 Wielka Podróż — quizowy prezent urodzinowy

Strona-prezent: mapa świata z zablokowanymi lokacjami (Meksyk → Anglia → Hiszpania → Wietnam → Malezja → Polska). Po każdej wygranej gratulacje + zdjęcie kolegi, a na końcu finał z numerem telefonu i informacją o lekcjach gry na gitarze.

Mobile-first, czysty HTML/CSS/JS — działa na GitHub Pages bez żadnego budowania.

## ✏️ Co podmienić (5 minut)

1. **Zdjęcia** → wrzuć do `assets/photos/`: `wygrana.jpg`, `przegrana.jpg`, `final.jpg`.
2. **Numer telefonu + teksty** → otwórz `js/config.js`, sekcja `CONFIG.final` (zmień `phone`).
3. **Imię kolegi** → `js/config.js`, pole `friendName`.

To wszystko. Reszta działa.

## ▶️ Podgląd lokalnie

Otwórz `index.html` w przeglądarce (działa też z pliku). Telefon → tryb mobilny w DevTools (F12).

## 🚀 Publikacja na GitHub Pages

1. Utwórz **publiczne** repo i wgraj wszystkie pliki (zachowaj strukturę folderów).
2. Repo → **Settings → Pages** → *Source*: `Deploy from a branch` → branch `main`, folder `/ (root)` → **Save**.
3. Po ~1 min strona będzie pod `https://<twoj-login>.github.io/<nazwa-repo>/`.
4. Wyślij link koledze 🎉

## 🧩 Stan gier

| Lokacja | Gra | Status |
|---|---|---|
| Meksyk | Piwo Corona pod kapeluszem (3 kapelusze) | ✅ gotowe |
| Anglia | The Blue / The Red (pułapka: 2× Red) | ✅ gotowe |
| Hiszpania | Flaga Alicante (pułapka: flaga Danii) | ✅ gotowe |
| Wietnam | Rysowanie drogi palcem | ✅ gotowe |
| Malezja | *(slot na kolejną grę)* | ⏳ placeholder |
| Polska | Finał — numer telefonu | ✅ gotowe |

Kolejne gry dodaje się w `js/games.js` + wpis w `js/config.js` (`LOCATIONS`).

## 🔁 Reset / postęp

Postęp zapisuje się w `localStorage`. Przycisk **↺ Reset** w prawym górnym rogu kasuje grę.
