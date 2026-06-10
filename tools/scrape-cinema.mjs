/**
 * Cinema scraper — run manually (e.g. weekly) to refresh the "Now Playing" page.
 *
 *   npm run scrape:cinema
 *
 * It auto-discovers the films currently playing from thessalonikiguide.gr's
 * listing page (no hardcoded film URLs), parses each film's metadata and its
 * full screening schedule (cinema / hall / date / times), and regenerates
 *   src/app/components/cinema/films.data.ts
 * which the Cinema component imports. Nothing else needs to change week to week.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { parse } from 'node-html-parser';

const SITE = 'https://www.thessalonikiguide.gr';
const LISTING_URL = `${SITE}/cinema/`;
const OUT_FILE = resolve(dirname(fileURLToPath(import.meta.url)), '../src/app/components/cinema/films.data.ts');

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

// ----------------------------------------------------------------- parsing

const tidy = (s) => (s || '').replace(/\s+/g, ' ').trim();
const slugFromUrl = (url) => url.replace(/\/+$/, '').split('/').pop();

/** Infer the calendar year for a day/month seen on the schedule. */
function isoDate(day, month) {
  const now = new Date();
  let year = now.getFullYear();
  let d = new Date(year, month - 1, day);
  // A date more than ~2 months in the past means the listing has rolled into next year.
  const daysAgo = (now - d) / 86400000;
  if (daysAgo > 60) {
    year += 1;
    d = new Date(year, month - 1, day);
  }
  return `${d.getFullYear()}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Parse one schedule table into { hall, sessions: { date: Set<time> } }. */
function parseTable(table) {
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
    const date = isoDate(dc.day, dc.month);
    for (const timeCols of timeColsList) {
      for (const t of timeCols[idx] || []) (sessions[date] ??= new Set()).add(t);
    }
  });
  return { hall, sessions };
}

/** Walk up from a table to the nearest ancestor holding this film's cinema link. */
function cinemaForTable(table) {
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

function parseFilm(root, url) {
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
    const cinema = cinemaForTable(table);
    if (!cinema) continue;
    const { hall, sessions } = parseTable(table);
    if (!Object.keys(sessions).length) continue;
    const key = cinema.slug || cinema.name;
    if (!byCinema.has(key)) byCinema.set(key, { cinema: cinema.name, cinemaSlug: cinema.slug, halls: [] });
    byCinema.get(key).halls.push({ hall, sessions });
  }

  const screenings = [...byCinema.values()].map((c) => {
    const merged = {}; // date -> Set<time>
    let hall = null;
    for (const h of c.halls) {
      hall = hall || h.hall;
      for (const [date, times] of Object.entries(h.sessions)) {
        for (const t of times) (merged[date] ??= new Set()).add(t);
      }
    }
    const sessions = Object.entries(merged)
      .map(([date, set]) => ({ date, times: [...set].sort() }))
      .sort((a, b) => a.date.localeCompare(b.date));
    return { cinema: c.cinema, cinemaSlug: c.cinemaSlug, hall, sessions };
  });

  const dates = [...new Set(screenings.flatMap((s) => s.sessions.map((x) => x.date)))].sort();

  return {
    slug: slugFromUrl(url),
    title,
    originalTitle,
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

// ----------------------------------------------------------------- output

function tsLiteral(value, indent = 0) {
  const pad = '  '.repeat(indent);
  const padIn = '  '.repeat(indent + 1);
  if (value === undefined || value === null) return 'undefined';
  if (typeof value === 'number') return String(value);
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
 * Source: ${LISTING_URL}
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
  console.log(`Discovering films from ${LISTING_URL} …`);
  const listing = await getHtml(LISTING_URL);
  const urls = [
    ...new Set(
      listing
        .querySelectorAll('a')
        .map((a) => a.getAttribute('href'))
        .filter((h) => h && /\/tainia\/[^/]+\/?$/.test(h))
        .map((h) => (h.startsWith('http') ? h : SITE + h)),
    ),
  ];
  console.log(`Found ${urls.length} films. Fetching pages (concurrency ${CONCURRENCY}) …`);

  const films = (
    await mapLimit(urls, CONCURRENCY, async (url) => {
      try {
        const film = parseFilm(await getHtml(url), url);
        const sessionCount = film.screenings.reduce((n, s) => n + s.sessions.length, 0);
        console.log(`  ✓ ${film.title} — ${film.screenings.length} cinemas, ${sessionCount} screening days`);
        return film;
      } catch (err) {
        console.warn(`  ✗ ${url}: ${err.message}`);
        return null;
      }
    })
  )
    .filter(Boolean)
    .sort((a, b) => a.title.localeCompare(b.title, 'el'));

  writeDataFile(films);
  console.log(`\nWrote ${films.length} films to ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
