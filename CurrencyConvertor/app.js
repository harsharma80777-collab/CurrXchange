/* ------------------------------------------------------------------
   Currency Converter - app.js  (currency list + logic in ONE file)
------------------------------------------------------------------ */

// currency code -> country code (used only to show the flag)
// Obsolete currencies from the old list (BYR, CYP, EEK, HRK, LTL, LVL, MTL, SKK, ZMK, ZWD, ...) were removed
// because current APIs no longer return rates for them.
const countryList = {
  AED: "AE",
  AFN: "AF",
  ALL: "AL",
  AMD: "AM",
  AOA: "AO",
  ARS: "AR",
  AUD: "AU",
  AWG: "AW",
  AZN: "AZ",
  BAM: "BA",
  BBD: "BB",
  BDT: "BD",
  BGN: "BG",
  BHD: "BH",
  BIF: "BI",
  BMD: "BM",
  BND: "BN",
  BOB: "BO",
  BRL: "BR",
  BSD: "BS",
  BTN: "BT",
  BWP: "BW",
  BYN: "BY",
  BZD: "BZ",
  CAD: "CA",
  CDF: "CD",
  CHF: "CH",
  CLP: "CL",
  CNY: "CN",
  COP: "CO",
  CRC: "CR",
  CUP: "CU",
  CVE: "CV",
  CZK: "CZ",
  DJF: "DJ",
  DKK: "DK",
  DOP: "DO",
  DZD: "DZ",
  EGP: "EG",
  ERN: "ER",
  ETB: "ET",
  EUR: "EU",
  FJD: "FJ",
  FKP: "FK",
  GBP: "GB",
  GEL: "GE",
  GHS: "GH",
  GIP: "GI",
  GMD: "GM",
  GNF: "GN",
  GTQ: "GT",
  GYD: "GY",
  HKD: "HK",
  HNL: "HN",
  HTG: "HT",
  HUF: "HU",
  IDR: "ID",
  ILS: "IL",
  INR: "IN",
  IQD: "IQ",
  IRR: "IR",
  ISK: "IS",
  JMD: "JM",
  JOD: "JO",
  JPY: "JP",
  KES: "KE",
  KGS: "KG",
  KHR: "KH",
  KMF: "KM",
  KPW: "KP",
  KRW: "KR",
  KWD: "KW",
  KYD: "KY",
  KZT: "KZ",
  LAK: "LA",
  LBP: "LB",
  LKR: "LK",
  LRD: "LR",
  LSL: "LS",
  LYD: "LY",
  MAD: "MA",
  MDL: "MD",
  MGA: "MG",
  MKD: "MK",
  MMK: "MM",
  MNT: "MN",
  MOP: "MO",
  MRU: "MR",
  MUR: "MU",
  MVR: "MV",
  MWK: "MW",
  MXN: "MX",
  MYR: "MY",
  MZN: "MZ",
  NAD: "NA",
  NGN: "NG",
  NIO: "NI",
  NOK: "NO",
  NPR: "NP",
  NZD: "NZ",
  OMR: "OM",
  PAB: "PA",
  PEN: "PE",
  PGK: "PG",
  PHP: "PH",
  PKR: "PK",
  PLN: "PL",
  PYG: "PY",
  QAR: "QA",
  RON: "RO",
  RSD: "RS",
  RUB: "RU",
  RWF: "RW",
  SAR: "SA",
  SBD: "SB",
  SCR: "SC",
  SDG: "SD",
  SEK: "SE",
  SGD: "SG",
  SOS: "SO",
  SRD: "SR",
  SSP: "SS",
  STN: "ST",
  SYP: "SY",
  SZL: "SZ",
  THB: "TH",
  TJS: "TJ",
  TMT: "TM",
  TND: "TN",
  TOP: "TO",
  TRY: "TR",
  TTD: "TT",
  TWD: "TW",
  TZS: "TZ",
  UAH: "UA",
  UGX: "UG",
  USD: "US",
  UYU: "UY",
  UZS: "UZ",
  VES: "VE",
  VND: "VN",
  VUV: "VU",
  WST: "WS",
  XAF: "CM",
  XCD: "AG",
  XOF: "SN",
  XPF: "PF",
  YER: "YE",
  ZAR: "ZA",
  ZMW: "ZM",
  ZWL: "ZW",
};

const form = document.querySelector("form");
const dropdowns = document.querySelectorAll(".dropdown select");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const amountInput = document.querySelector(".amount input");
const swapBtn = document.querySelector(".swap");
const getBtn = document.querySelector(".get-rate");
const result = document.querySelector(".result");
const resultLabel = document.querySelector(".result-label");
const resultValue = document.querySelector(".result-value");
const resultNote = document.querySelector(".result-note");

/* ---------------- Rate providers (free, no API key) ----------------
   They are tried in order. If one fails, the next one is used.
   1) fawazahmed0 currency-api via jsDelivr CDN
   2) same API on the Cloudflare mirror
   3) open.er-api.com (ExchangeRate-API open access)
   4) api.frankfurter.dev (ECB and other central banks)
--------------------------------------------------------------------- */
const FETCH_TIMEOUT_MS = 5000; // give up on a server after 5 seconds

async function fetchJSON(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

const providers = [
  async (from, to) => {
    const f = from.toLowerCase();
    const t = to.toLowerCase();
    const data = await fetchJSON(
      `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${f}.min.json`
    );
    return { rate: data[f][t], date: data.date };
  },
  async (from, to) => {
    const f = from.toLowerCase();
    const t = to.toLowerCase();
    const data = await fetchJSON(
      `https://latest.currency-api.pages.dev/v1/currencies/${f}.min.json`
    );
    return { rate: data[f][t], date: data.date };
  },
  async (from, to) => {
    const data = await fetchJSON(`https://open.er-api.com/v6/latest/${from}`);
    if (data.result !== "success") throw new Error("API error");
    return { rate: data.rates[to], date: data.time_last_update_utc };
  },
  async (from, to) => {
    const data = await fetchJSON(
      `https://api.frankfurter.dev/v2/rate/${from.toLowerCase()}/${to.toLowerCase()}`
    );
    return { rate: data.rate, date: data.date || "today" };
  },
];

async function getRate(from, to) {
  for (const provider of providers) {
    try {
      const { rate, date } = await provider(from, to);
      if (typeof rate === "number" && isFinite(rate)) {
        return { rate, date };
      }
    } catch (err) {
      const why = err.name === "AbortError" ? "timed out" : err.message;
      console.warn(`Rate server #${providers.indexOf(provider) + 1} failed (${why}), trying the next one`);
    }
  }
  throw new Error("No rate available");
}

/* ---------------- Fill the dropdowns ---------------- */
for (const select of dropdowns) {
  for (const currCode in countryList) {
    const option = document.createElement("option");
    option.value = currCode;
    option.innerText = currCode;

    if (select.name === "from" && currCode === "USD") option.selected = true;
    if (select.name === "to" && currCode === "INR") option.selected = true;

    select.append(option);
  }

  select.addEventListener("change", (evt) => {
    updateFlag(evt.target);
    markOutdated();
  });
}

/* ---------------- Helpers ---------------- */
const updateFlag = (select) => {
  const countryCode = countryList[select.value];
  const img = select.parentElement.querySelector("img");
  img.style.visibility = "visible";
  img.src = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
  img.alt = `${select.value} flag`;
};

const formatNumber = (n) =>
  n.toLocaleString(undefined, {
    maximumFractionDigits: Math.abs(n) >= 1 ? 4 : 8,
  });

let latestRequest = 0; // ignore out-of-date responses

// Result block: message only (loading / hint / error)
const showStatus = (text, type = "") => {
  result.className = `result status ${type}`.trim();
  resultNote.innerText = text;
};

// Result block: the big converted answer
const showResult = (label, value, note) => {
  result.className = "result";
  resultLabel.innerText = label;
  resultValue.innerText = value;
  resultNote.innerText = note;
};

// Called when the user changes something: the old result no longer matches
const markOutdated = () => {
  latestRequest++; // cancel any request still in flight
  getBtn.disabled = false;
  showStatus('Press "Get Exchange Rate" to convert.');
};

/* ---------------- Main function ---------------- */
const updateExchangeRate = async () => {
  let amount = parseFloat(amountInput.value);
  if (!(amount > 0)) {
    amount = 1;
    amountInput.value = "1";
  }

  const from = fromCurr.value;
  const to = toCurr.value;
  const requestId = ++latestRequest;

  showStatus("Fetching exchange rate…");
  getBtn.disabled = true;

  try {
    const { rate, date } = await getRate(from, to);
    if (requestId !== latestRequest) return; // a newer request is running

    showResult(
      `${formatNumber(amount)} ${from} =`,
      `${formatNumber(amount * rate)} ${to}`,
      `1 ${from} = ${formatNumber(rate)} ${to} · rates as of ${date}`
    );
  } catch (err) {
    if (requestId !== latestRequest) return;
    showStatus("Could not reach the rate servers. Check your internet (or try another network) and press the button again.", "error");
  } finally {
    if (requestId === latestRequest) getBtn.disabled = false;
  }
};

/* ---------------- Events ---------------- */
form.addEventListener("submit", (evt) => {
  evt.preventDefault();
  updateExchangeRate();
});

swapBtn.addEventListener("click", () => {
  [fromCurr.value, toCurr.value] = [toCurr.value, fromCurr.value];
  updateFlag(fromCurr);
  updateFlag(toCurr);
  markOutdated();
});

// Typing a new amount does not convert until the button is pressed
amountInput.addEventListener("input", markOutdated);

// Hide a flag image if it fails to load
document.querySelectorAll(".select-container img").forEach((img) => {
  img.addEventListener("error", () => (img.style.visibility = "hidden"));
});

window.addEventListener("load", () => {
  updateFlag(fromCurr);
  updateFlag(toCurr);
  updateExchangeRate();
});