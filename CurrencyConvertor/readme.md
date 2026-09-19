# Currency Converter

A simple, fast currency converter built with plain **HTML, CSS and JavaScript**. No frameworks, no build step, no API key. Pick two currencies, enter an amount, press **Get Exchange Rate**, and the result appears in a highlighted block.

<!-- Add a screenshot: save it as screenshot.png in this folder, then uncomment the next line
![Currency Converter screenshot](screenshot.png)
-->

## Features

- Convert between **150+ currencies** (default: USD to INR)
- Country **flag** shown next to each currency, updated when you change the dropdown
- **Swap** button to reverse the two currencies
- Result shown in a **block**: the converted amount in large text, plus the per-unit rate and the date of the rates
- **Four free rate servers** tried in order, so one blocked or slow server does not break the app
- Each server gets a **5 second time limit**; if all fail, a clear red error is shown instead of loading forever
- Loading, hint and error messages appear inside the same result block
- Responsive layout that works on phones and desktops
- No API key, no sign-up, no dependencies

## Project structure

```
currency-converter/
├── index.html                          # page structure
├── style.css                           # all styling
├── app.js                              # currency list + all logic
└── currency-converter-single-file.html # optional: everything in one file
```

`currency-converter-single-file.html` is a backup copy with the HTML, CSS and JS combined. You do not need it if you use the three separate files.

## How to run

1. Put `index.html`, `style.css` and `app.js` in **the same folder** (file names must match exactly).
2. Double-click `index.html` to open it in your browser. You need an internet connection to fetch rates.

That is all. No installation is needed. If you prefer a local server, run `python -m http.server` in the folder and open `http://localhost:8000`.

## How it works

1. `app.js` contains the `countryList` object, which maps each currency code (for example `INR`) to a country code (`IN`). This fills both dropdowns and picks the flag image.
2. When you press the button (and once when the page first loads), `updateExchangeRate()` reads the amount and the two currencies.
3. `getRate(from, to)` asks the rate servers one by one until one returns a valid number.
4. The result is calculated as `amount x rate` and shown in the result block.
5. If you change the amount, a currency, or swap them, the old result is replaced by a hint to press the button again, so the block never shows an answer that does not match the selection.

Extra safeguards in the code:

- A request counter ignores late responses from older requests.
- An amount that is empty, zero or negative is reset to `1`.
- Numbers are formatted with up to 4 decimals (8 for very small values).

## APIs used

All are free and need no API key. They are tried in this order:

| Order | Server | Notes |
| --- | --- | --- |
| 1 | `cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/{code}.min.json` | Main source, 200+ currencies, no rate limits, updated daily |
| 2 | `latest.currency-api.pages.dev/v1/currencies/{code}.min.json` | Cloudflare mirror of the same data |
| 3 | `open.er-api.com/v6/latest/{CODE}` | ExchangeRate-API open access, updated once a day, attribution required |
| 4 | `api.frankfurter.dev/v2/rate/{from}/{to}` | Central bank data, no quotas but rate-limited against abuse |

Flags come from [flagcdn.com](https://flagcdn.com).

**About "real-time" rates:** these free services update **once per day**, so the app shows the latest daily rate, not live market ticks. Frankfurter itself says it is not meant for live trading. For hourly or per-minute updates you need a provider with an API key, and those usually have paid plans.

## Customisation

| I want to... | Change this |
| --- | --- |
| Change the default currencies | In `app.js`, the lines `currCode === "USD"` and `currCode === "INR"` inside the dropdown loop |
| Change the timeout | `FETCH_TIMEOUT_MS` near the top of the API section in `app.js` |
| Change the colours | `#af4d98` (purple) and `#f4e4ba` (background) in `style.css` |
| Change the font | The `font-family` line in the `body` rule of `style.css` (delete it for the browser's default serif) |
| Add or remove a currency | Edit the `countryList` object in `app.js` |
| Use only one API | Remove the other functions from the `providers` array in `app.js` |

## Troubleshooting

| Problem | Likely cause and fix |
| --- | --- |
| Dropdowns are empty | `app.js` did not load. Check the file name and that it is in the same folder as `index.html`. On Windows, make sure it is not really `app.js.txt` (turn on File name extensions in File Explorer). |
| Stuck on "Fetching exchange rate..." | Your network may be blocking a rate server. Wait up to 20 seconds for the fallbacks. Open the link in the API table in a browser tab to test it, or try another network or turn off VPN and ad-blockers. |
| Red error message | All four servers failed. Check your internet connection and press the button again. |
| Result block looks like plain text | `style.css` is the old version. Replace it with the latest file and hard refresh with **Ctrl + Shift + R**. |
| A flag is missing | The flag image failed to load (it is hidden automatically). The conversion still works. |
| "Could not reach the rate servers" for one currency only | That currency may not be available in the APIs. Remove it from `countryList` in `app.js`. |

Press **F12** and open the **Console** tab to see which rate server failed and why.

## Ideas to extend the project

**Easy (good next steps)**
- Show the full currency name next to the code (for example `INR - Indian Rupee`), using the currency list endpoint of the API
- Add a **Copy result** button using `navigator.clipboard.writeText()`
- Remember the last chosen currencies and amount with `localStorage`
- Add a **dark mode** toggle
- Format numbers with the Indian digit grouping (`toLocaleString("en-IN")`)
- Pick default currencies from the user's language using `navigator.language`

**Medium**
- Make the dropdowns **searchable** (type "yen" to find JPY)
- Add a **favourites** list of frequently used currencies at the top of each dropdown
- Show a **multi-currency table**: one amount converted to 5 to 10 currencies at once
- Cache the last successful rates so the app still works **offline**, and show "offline: rates from yesterday"
- Add keyboard shortcuts and better screen-reader labels
- Add a small **loading spinner** on the button

**Advanced**
- Draw a **7-day or 30-day rate history chart** with Chart.js (the fawazahmed0 API supports dates in the URL as `@YYYY-MM-DD`, and Frankfurter has a time-series endpoint)
- Add **rate alerts**: "tell me when USD to INR goes above X"
- Support **cryptocurrencies and metals** (the fawazahmed0 API includes some, for example BTC)
- Turn it into a **PWA** (installable app with a service worker)
- Rewrite it in **React** as a practice project
- Put the API calls behind a small **Node/Express backend** with caching, and use a paid real-time API with a hidden key
- Add **unit tests** for `getRate` and the number formatting using Jest or Vitest

## Deploy it online (free)

- **GitHub Pages:** push the folder to a GitHub repository, then Settings, Pages, choose the `main` branch
- **Netlify or Vercel:** drag and drop the folder or connect the repository

Only static hosting is needed, since everything runs in the browser.

## Credits and attribution

- Exchange rates: [fawazahmed0/exchange-api](https://github.com/fawazahmed0/exchange-api)
- Fallback rates: [ExchangeRate-API](https://www.exchangerate-api.com) (open access endpoint), [Frankfurter](https://frankfurter.dev)
- Flags: [flagcdn.com](https://flagcdn.com)

Exchange rates are for information only and may differ from the rates banks and money-transfer services actually give you. Do not rely on this app for trading or financial decisions.

## Author

Built by *your name here* as a JavaScript practice project. Feel free to edit, extend and share.