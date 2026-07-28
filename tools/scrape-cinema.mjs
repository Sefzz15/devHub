/**
 * Cinema scraper — run manually (e.g. weekly) to refresh the "Now Playing" page.
 *
 *   npm run scrape:cinema
 *
 * It scrapes two sources and merges them into one film list:
 *   • Thessaloniki — thessalonikiguide.gr  (city "Θεσσαλονίκη")
 *   • Athens       — athinorama.gr          (city "Αθήνα")
 *
 * Each source auto-discovers the films currently playing (no hardcoded film
 * URLs), parses each film's metadata and its screening schedule (cinema /
 * date / times), and the combined result regenerates
 *   src/app/components/cinema/films.data.ts
 * which the Cinema component imports. Nothing else needs to change week to week.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { parse } from 'node-html-parser';

const OUT_FILE = resolve(dirname(fileURLToPath(import.meta.url)), '../src/app/components/cinema/films.data.ts');

const CITY_THESSALONIKI = 'Θεσσαλονίκη';
const CITY_ATHENS = 'Αθήνα';

const CONCURRENCY = 4;
const UA = 'Mozilla/5.0 (compatible; devHub-cinema-scraper)';

// ----------------------------------------------------------------- fetching

async function getHtml(url, attempt = 1) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parse(await res.text());
  } catch (err) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 800 * attempt));
      return getHtml(url, attempt + 1);
    }
    throw new Error(`Failed to fetch ${url}: ${err.message}`);
  }
}

/** Run an async mapper over items with a bounded number in flight. */
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx], idx);
      }
    }),
  );
  return out;
}

// ----------------------------------------------------------------- shared helpers

const tidy = (s) => (s || '').replace(/\s+/g, ' ').trim();
const slugFromUrl = (url) => url.replace(/\/+$/, '').split('/').pop();
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Build the { cinema, cinemaSlug, openAir, sessions } screening list from a date→Set<time> map per cinema. */
function buildScreenings(byCinema) {
  return [...byCinema.values()].map((c) => ({
    cinema: c.cinema,
    cinemaSlug: c.cinemaSlug,
    hall: c.hall,
    openAir: c.openAir || undefined, // omit for indoor cinemas
    sessions: Object.entries(c.dates)
      .map(([date, set]) => ({ date, times: [...set].sort() }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  }));
}

// ================================================================= Thessaloniki source
// Source: thessalonikiguide.gr. Listing is paginated: page 1 is /cinema/,
// page N (N>=2) is /cinema/page/N/.

const TG_SITE = 'https://www.thessalonikiguide.gr';
const TG_LISTING_URL = `${TG_SITE}/cinema/`;
const TG_listingPageUrl = (page) => (page <= 1 ? TG_LISTING_URL : `${TG_SITE}/cinema/page/${page}/`);
const TG_MAX_LISTING_PAGES = 10; // safety cap so a broken "next" link can't loop forever

/** Infer the calendar year for a day/month seen on the schedule. */
function tgIsoDate(day, month) {
  const now = new Date();
  let year = now.getFullYear();
  let d = new Date(year, month - 1, day);
  // A date more than ~2 months in the past means the listing has rolled into next year.
  const daysAgo = (now - d) / 86400000;
  if (daysAgo > 60) {
    year += 1;
    d = new Date(year, month - 1, day);
  }
  return iso(d);
}

/** Parse one schedule table into { hall, sessions: { date: Set<time> } }. */
function tgParseTable(table) {
  const rows = table.querySelectorAll('tr');
  let hall = null;
  let dateCols = []; // index -> { day, month }
  const timeColsList = []; // each entry: index -> string[] of times

  for (const tr of rows) {
    const cells = tr.querySelectorAll('td');
    if (cells.length === 1 && tr.querySelector('td[colspan]')) {
      hall = tidy(cells[0].text) || hall;
      continue;
    }
    const texts = cells.map((td) => td.text);
    if (texts.some((t) => /\b\d{1,2}\/\d{1,2}\b/.test(t))) {
      dateCols = texts.map((t) => {
        const m = t.match(/(\d{1,2})\/(\d{1,2})/);
        return m ? { day: +m[1], month: +m[2] } : null;
      });
    } else if (texts.some((t) => /\d{1,2}:\d{2}/.test(t))) {
      timeColsList.push(texts.map((t) => [...t.matchAll(/(\d{1,2}:\d{2})/g)].map((x) => x[1])));
    }
  }

  const sessions = {};
  dateCols.forEach((dc, idx) => {
    if (!dc) return;
    const date = tgIsoDate(dc.day, dc.month);
    for (const timeCols of timeColsList) {
      for (const t of timeCols[idx] || []) (sessions[date] ??= new Set()).add(t);
    }
  });
  return { hall, sessions };
}

/** Walk up from a table to the nearest ancestor holding this film's cinema link. */
function tgCinemaForTable(table) {
  let node = table.parentNode;
  for (let d = 0; d < 5 && node; d++, node = node.parentNode) {
    const link = node.querySelectorAll?.('a')?.find((a) => {
      const href = a.getAttribute('href') || '';
      return href.startsWith('http') && href.includes('/cinemas/');
    });
    if (link) return { name: tidy(link.text), slug: slugFromUrl(link.getAttribute('href')) };
  }
  return null;
}

function tgParseFilm(root, url) {
  const meta = (prop) => root.querySelector(`meta[property="${prop}"]`)?.getAttribute('content');
  const itemText = (prop) => tidy(root.querySelector(`[itemprop="${prop}"]`)?.text);

  // og:title is usually "Greek Title (Original / International Title)".
  const rawTitle = tidy(meta('og:title')) || tidy(root.querySelector('h1')?.text);
  const titleMatch = rawTitle.match(/^(.*?)\s*\((.+)\)\s*$/);
  const title = titleMatch ? titleMatch[1].trim() : rawTitle;
  const originalTitle = titleMatch ? titleMatch[2].trim() : undefined;
  const year = parseInt(itemText('datePublished'), 10) || undefined;
  const durationMin = parseInt((itemText('duration').match(/\d+/) || [])[0], 10) || undefined;
  const genres = root.querySelectorAll('[itemprop="genre"]').map((n) => tidy(n.text)).filter(Boolean);
  const director = tidy(root.querySelector('[itemprop="director"]')?.text) || undefined;
  const cast = root
    .querySelectorAll('[itemprop="actor"]')
    .map((n) => tidy(n.text).replace(/[,·]\s*$/, ''))
    .filter(Boolean);
  const ratingMatch = root.text.match(/IMDb\s*([0-9]+[.,][0-9]+)/);
  const rating = ratingMatch ? parseFloat(ratingMatch[1].replace(',', '.')) : undefined;

  // Schedule: group tables by their cinema.
  const byCinema = new Map();
  for (const table of root.querySelectorAll('table.python-table')) {
    const cinema = tgCinemaForTable(table);
    if (!cinema) continue;
    const { hall, sessions } = tgParseTable(table);
    if (!Object.keys(sessions).length) continue;
    const key = cinema.slug || cinema.name;
    // thessalonikiguide marks open-air cinemas in the name (e.g. "Απόλλων Θερινός").
    if (!byCinema.has(key))
      byCinema.set(key, { cinema: cinema.name, cinemaSlug: cinema.slug, hall, openAir: /Θεριν/.test(cinema.name), dates: {} });
    const rec = byCinema.get(key);
    rec.hall = rec.hall || hall;
    for (const [date, times] of Object.entries(sessions)) for (const t of times) (rec.dates[date] ??= new Set()).add(t);
  }

  const screenings = buildScreenings(byCinema);
  const dates = [...new Set(screenings.flatMap((s) => s.sessions.map((x) => x.date)))].sort();

  return {
    slug: slugFromUrl(url),
    title,
    originalTitle,
    city: CITY_THESSALONIKI,
    year,
    durationMin,
    genres,
    rating,
    director,
    cast,
    description: tidy(meta('og:description')) || undefined,
    poster: meta('og:image') || undefined,
    url,
    cinemas: screenings.map((s) => s.cinema),
    screenings,
    dates,
  };
}

/** Extract this listing page's film URLs (absolute, deduped within the page). */
function tgFilmUrlsFromListing(listing) {
  return [
    ...new Set(
      listing
        .querySelectorAll('a')
        .map((a) => a.getAttribute('href'))
        .filter((h) => h && /\/tainia\/[^/]+\/?$/.test(h))
        .map((h) => (h.startsWith('http') ? h : TG_SITE + h)),
    ),
  ];
}

/** Walk the paginated listing, collecting film URLs until a page adds none. */
async function tgDiscoverFilmUrls() {
  const urls = new Set();
  for (let page = 1; page <= TG_MAX_LISTING_PAGES; page++) {
    const url = TG_listingPageUrl(page);
    let listing;
    try {
      listing = await getHtml(url);
    } catch (err) {
      // Pages past the last one 404 — that's the normal end of pagination.
      if (page > 1) break;
      throw err;
    }
    const found = tgFilmUrlsFromListing(listing);
    const before = urls.size;
    for (const u of found) urls.add(u);
    const added = urls.size - before;
    console.log(`  page ${page}: ${found.length} films (${added} new)`);
    // A page with no films, or one that only repeats earlier films, means we're done.
    if (!found.length || added === 0) break;
  }
  return [...urls];
}

async function scrapeThessaloniki() {
  console.log(`\n[Θεσσαλονίκη] Discovering films from ${TG_LISTING_URL} …`);
  const urls = await tgDiscoverFilmUrls();
  console.log(`[Θεσσαλονίκη] Found ${urls.length} films. Fetching (concurrency ${CONCURRENCY}) …`);
  return collectFilms(urls, (url) => tgParseFilm(url.root, url.url));
}

// ================================================================= Athens source
// Source: athinorama.gr. The /cinema listing already contains every currently
// playing film; each movie page carries the metadata and, in its .piatsa-block
// sections, every cinema with a brief weekly schedule ("Πέμ.-Κυρ. : 21.00").

const AR_SITE = 'https://www.athinorama.gr';
const AR_LISTING_URL = `${AR_SITE}/cinema`;

// Greek weekday abbreviations → JS getDay() (Sun=0 … Sat=6). Matched on the
// first two accent-stripped letters, which are unambiguous across all seven.
const AR_DOW = { ΔΕ: 1, ΤΡ: 2, ΤΕ: 3, ΠΕ: 4, ΠΑ: 5, ΣΑ: 6, ΚΥ: 0 };
const stripAccents = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
function arDow(token) {
  const key = stripAccents(token).toUpperCase().replace(/[^Α-Ω]/g, '').slice(0, 2);
  return AR_DOW[key];
}

/**
 * Map a weekday to a date within the current Greek cinema week, which runs
 * Thursday→Wednesday and changes every Thursday. The brief schedule on the site
 * always describes this current week, so we anchor on the most recent Thursday
 * (≤ today). Past days in the week are fine — the UI hides dates before today.
 */
function arWeekDate(dow, from = new Date()) {
  const base = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const sinceThursday = (base.getDay() - 4 + 7) % 7; // Thu=4
  const thursday = new Date(base);
  thursday.setDate(base.getDate() - sinceThursday);
  const offset = (dow - 4 + 7) % 7; // position within Thu..Wed week
  const d = new Date(thursday);
  d.setDate(thursday.getDate() + offset);
  return iso(d);
}

/**
 * Parse a brief schedule string into { isoDate: Set<time> }.
 * Examples: "Τετ. : 23.10", "Τετ. : 21.00/ 23.00", "Πέμ.-Κυρ. : 21.00".
 * Parenthetical notes (special-event blurbs) are stripped before parsing.
 */
function arParseBrief(raw) {
  const text = raw.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  const groupRe =
    /([Α-Ωα-ωΆ-Ώά-ώ]{2,}\.?(?:\s*-\s*[Α-Ωα-ωΆ-Ώά-ώ]{2,}\.?)?)\s*:\s*([0-9.,/\s]+?)(?=(?:[Α-Ωα-ωΆ-Ώά-ώ]{2,}\.?\s*:)|$)/g;
  const out = {};
  let m;
  while ((m = groupRe.exec(text))) {
    const times = [...m[2].matchAll(/(\d{1,2})[.:](\d{2})/g)].map((t) => `${t[1].padStart(2, '0')}:${t[2]}`);
    if (!times.length) continue;

    const ends = m[1].split(/\s*-\s*/).map(arDow);
    let dows;
    if (ends.length === 2 && ends[0] !== undefined && ends[1] !== undefined) {
      // Inclusive day range, e.g. Πέμ.(Thu)–Κυρ.(Sun). Walk Thu..Wed positions.
      const start = (ends[0] - 4 + 7) % 7;
      const end = (ends[1] - 4 + 7) % 7;
      dows = [];
      for (let p = start; ; p = (p + 1) % 7) {
        dows.push((p + 4) % 7);
        if (p === end) break;
      }
    } else {
      const d = arDow(m[1]);
      dows = d === undefined ? [] : [d];
    }

    for (const dow of dows) {
      const date = arWeekDate(dow);
      out[date] ??= new Set();
      for (const t of times) out[date].add(t);
    }
  }
  return out;
}

function arParseFilm(root, url) {
  const rt = root.querySelector('.review-title') || root;
  const detail = (cls) => tidy(rt.querySelector(`.review-details .${cls}`)?.text);

  const title = tidy(rt.querySelector('h1')?.text);
  const originalTitle = tidy(rt.querySelector('.original-title')?.text) || undefined;
  const year = parseInt(detail('year'), 10) || undefined;
  const durationMin = parseInt((detail('duration').match(/\d+/) || [])[0], 10) || undefined;

  // Athinorama's critic rating is out of 5 stars; scale to /10 for the UI.
  const starsStyle = rt.querySelector('.rating-stars')?.getAttribute('style') || '';
  const stars = parseFloat((starsStyle.match(/--stars:\s*([\d.]+)/) || [])[1]);
  const rating = Number.isNaN(stars) ? undefined : Math.round(stars * 2 * 10) / 10;

  // review-tags are [genre(s)…, nationality]; the nationality is always last.
  const tags = rt.querySelectorAll('.review-tags li').map((l) => tidy(l.text)).filter(Boolean);
  const genres = tags.length > 1 ? tags.slice(0, -1) : tags;

  const crew = (label) => {
    const item = root
      .querySelectorAll('.cast-crew .cast-crew-item')
      .find((it) => tidy(it.querySelector('h4')?.text).includes(label));
    return item ? item.querySelectorAll('nav a').map((a) => tidy(a.text)).filter(Boolean) : [];
  };
  const director = crew('Σκηνοθ')[0] || undefined;
  const cast = crew('Με τους');
  const description = tidy(root.querySelector('.article .summary, .review-header .summary')?.text) || undefined;
  const poster = root.querySelector('meta[property="og:image"]')?.getAttribute('content') || undefined;

  // Schedule: every cinema showing the film sits in a .piatsa-block card-item.
  const byCinema = new Map();
  for (const block of root.querySelectorAll('.piatsa-block')) {
    for (const card of block.querySelectorAll('.card-item')) {
      const link = card.querySelector('.item-title a');
      const infos = card.querySelector('.schedule-infos');
      if (!link || !infos) continue;
      const dates = arParseBrief(infos.text);
      if (!Object.keys(dates).length) continue;
      const cinema = tidy(link.text);
      const cinemaSlug = slugFromUrl(link.getAttribute('href') || '') || cinema;
      // athinorama marks open-air cinemas with a "summerRoom" sun badge, not in the name.
      const openAir =
        card.querySelectorAll('img').some((i) => (i.getAttribute('src') || '').includes('summerRoom')) ||
        /Θεριν/.test(cinema);
      if (!byCinema.has(cinemaSlug)) byCinema.set(cinemaSlug, { cinema, cinemaSlug, hall: undefined, openAir, dates: {} });
      const rec = byCinema.get(cinemaSlug);
      for (const [date, set] of Object.entries(dates)) for (const t of set) (rec.dates[date] ??= new Set()).add(t);
    }
  }

  const screenings = buildScreenings(byCinema);
  const dates = [...new Set(screenings.flatMap((s) => s.sessions.map((x) => x.date)))].sort();

  return {
    slug: slugFromUrl(url),
    title,
    originalTitle,
    city: CITY_ATHENS,
    year,
    durationMin,
    genres,
    rating,
    director,
    cast,
    description,
    poster,
    url,
    cinemas: screenings.map((s) => s.cinema),
    screenings,
    dates,
  };
}

/** The /cinema listing already lists every currently-playing film. */
function arFilmUrlsFromListing(listing) {
  return [
    ...new Set(
      listing
        .querySelectorAll('a')
        .map((a) => a.getAttribute('href'))
        .filter((h) => h && /\/cinema\/movie\/[a-z0-9_-]+-\d+\/?$/i.test(h))
        .map((h) => (h.startsWith('http') ? h : AR_SITE + h)),
    ),
  ];
}

async function scrapeAthens() {
  console.log(`\n[Αθήνα] Discovering films from ${AR_LISTING_URL} …`);
  const listing = await getHtml(AR_LISTING_URL);
  const urls = arFilmUrlsFromListing(listing);
  console.log(`[Αθήνα] Found ${urls.length} films. Fetching (concurrency ${CONCURRENCY}) …`);
  return collectFilms(urls, (url) => arParseFilm(url.root, url.url));
}

// ----------------------------------------------------------------- fetch + parse driver

/** Fetch every url and parse it, dropping films with no screenings and logging progress. */
async function collectFilms(urls, parseFn) {
  const films = (
    await mapLimit(urls, CONCURRENCY, async (url) => {
      try {
        const film = parseFn({ root: await getHtml(url), url });
        if (!film.screenings.length) return null; // coming-soon / not currently playing
        const sessionCount = film.screenings.reduce((n, s) => n + s.sessions.length, 0);
        console.log(`  ✓ ${film.title} — ${film.screenings.length} cinemas, ${sessionCount} screening days`);
        return film;
      } catch (err) {
        console.warn(`  ✗ ${url}: ${err.message}`);
        return null;
      }
    })
  ).filter(Boolean);
  return films;
}

// ----------------------------------------------------------------- output

function tsLiteral(value, indent = 0) {
  const pad = '  '.repeat(indent);
  const padIn = '  '.repeat(indent + 1);
  if (value === undefined || value === null) return 'undefined';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  if (Array.isArray(value)) {
    if (!value.length) return '[]';
    const items = value.map((v) => padIn + tsLiteral(v, indent + 1));
    return `[\n${items.join(',\n')},\n${pad}]`;
  }
  const entries = Object.entries(value)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${padIn}${k}: ${tsLiteral(v, indent + 1)}`);
  return `{\n${entries.join(',\n')},\n${pad}}`;
}

function writeDataFile(films) {
  const header = `import { IFilm } from '../../../interfaces/IFilm';

/**
 * AUTO-GENERATED by tools/scrape-cinema.mjs — do not edit by hand.
 * Sources: ${TG_LISTING_URL} (Θεσσαλονίκη), ${AR_LISTING_URL} (Αθήνα)
 * Generated: ${new Date().toISOString()}
 *
 * Re-run \`npm run scrape:cinema\` to refresh the listings and showtimes.
 */
export const SCRAPED_AT = '${new Date().toISOString()}';

export const FILMS: IFilm[] = `;

  writeFileSync(OUT_FILE, header + tsLiteral(films, 0) + ';\n', 'utf-8');
}

// ----------------------------------------------------------------- main

async function main() {
  const results = await Promise.allSettled([scrapeThessaloniki(), scrapeAthens()]);

  const films = [];
  const labels = [CITY_THESSALONIKI, CITY_ATHENS];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') films.push(...r.value);
    else console.error(`\n${labels[i]} source failed: ${r.reason?.message || r.reason}`);
  });

  if (!films.length) throw new Error('No films scraped from any source — aborting write.');

  films.sort((a, b) => a.title.localeCompare(b.title, 'el') || a.city.localeCompare(b.city, 'el'));

  writeDataFile(films);
  const byCity = labels.map((c) => `${films.filter((f) => f.city === c).length} ${c}`).join(', ');
  console.log(`\nWrote ${films.length} films (${byCity}) to ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
