import { Component, OnInit } from '@angular/core';
import { IFilm } from '../../../interfaces/IFilm';
import { FILMS, SCRAPED_AT } from './films.data';
import { TranslationService } from '../../../services/translation.service';

type SortKey = 'rating' | 'year' | 'title';

/** A flattened "this cinema, these times" row for the selected day. */
interface CinemaShowtimes {
  cinema: string;
  hall?: string;
  times: string[];
}

/** A cinema's upcoming days, used in the "all dates" view. */
interface CinemaAgenda {
  cinema: string;
  hall?: string;
  days: { date: string; times: string[] }[];
}

@Component({
  standalone: false,
  selector: 'app-cinema',
  templateUrl: './cinema.component.html',
  styleUrls: ['../admin/admin.component.css', './cinema.component.css'],
})
export class CinemaComponent implements OnInit {
  private readonly films: IFilm[] = FILMS;
  readonly scrapedAt = SCRAPED_AT;

  // Two-way bound via [(ngModel)], so kept as plain properties.
  query = '';
  selectedGenre = '';
  selectedCinema = '';
  /** '' = every city; otherwise a city name from the data (e.g. "Αθήνα"). */
  selectedCity = '';
  /** '' = every upcoming day; otherwise an ISO date. */
  selectedDate = '';
  sortKey: SortKey = 'rating';
  /** Open-air (θερινός) cinemas only. */
  therinosOnly = false;

  readonly today = this.toIso(new Date());

  constructor(private _i18n: TranslationService) {}

  ngOnInit(): void {
    this.selectedDate = this.defaultDate();
  }

  /** Films in the currently selected city (all films when no city is chosen). */
  private filmsInCity(): IFilm[] {
    return this.selectedCity ? this.films.filter((f) => f.city === this.selectedCity) : this.films;
  }

  /** Distinct cities that have films, sorted. */
  get cities(): string[] {
    return this.distinct(this.films.map((f) => f.city));
  }

  get genres(): string[] {
    return this.distinct(this.filmsInCity().flatMap((f) => f.genres));
  }

  /** Cinemas in the selected city — keeps the dropdown relevant per city. */
  get cinemas(): string[] {
    return this.distinct(this.filmsInCity().flatMap((f) => f.cinemas));
  }

  /** Distinct upcoming ISO dates anything screens on (today onward). */
  get availableDates(): string[] {
    return this.distinct(this.filmsInCity().flatMap((f) => f.dates))
      .filter((d) => d >= this.today)
      .sort();
  }

  private distinct(values: string[]): string[] {
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'el'));
  }

  private toIso(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /** Today if anything plays today, else the next day that has screenings. */
  private defaultDate(): string {
    const dates = this.availableDates;
    return dates.includes(this.today) ? this.today : dates[0] ?? '';
  }

  /** Localised city name for the picker (data stores the Greek name). */
  cityLabel(city: string): string {
    const key = city === 'Αθήνα' ? 'cinema.athens' : city === 'Θεσσαλονίκη' ? 'cinema.thessaloniki' : '';
    return key ? this._i18n.translate(key) : city;
  }

  /** Keep the day/cinema filters valid after switching city. */
  onCityChange(): void {
    if (this.selectedCinema && !this.cinemas.includes(this.selectedCinema)) this.selectedCinema = '';
    if (this.selectedDate && !this.availableDates.includes(this.selectedDate)) this.selectedDate = this.defaultDate();
  }

  get tomorrow(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return this.toIso(d);
  }

  setDate(date: string): void {
    this.selectedDate = date;
  }

  /** Friendly label for a date chip / option: "Today", "Tomorrow" or "Sat 7 Jun". */
  dateLabel(iso: string): string {
    if (iso === this.today) return this._i18n.translate('cinema.today');
    if (iso === this.tomorrow) return this._i18n.translate('cinema.tomorrow');
    const [y, m, d] = iso.split('-').map(Number);
    const locale = this._i18n.lang() === 'el' ? 'el-GR' : 'en-GB';
    return new Date(y, m - 1, d).toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  /** Cinemas + times for a film on the selected day (respects the cinema filter). */
  showtimesOn(film: IFilm, date: string): CinemaShowtimes[] {
    const rows: CinemaShowtimes[] = [];
    for (const s of film.screenings) {
      if (this.selectedCinema && s.cinema !== this.selectedCinema) continue;
      if (this.therinosOnly && !s.openAir) continue;
      const session = s.sessions.find((x) => x.date === date);
      if (session?.times.length) rows.push({ cinema: s.cinema, hall: s.hall, times: session.times });
    }
    return rows;
  }

  /** Per-cinema upcoming agenda for the "all dates" view (respects the cinema filter). */
  agenda(film: IFilm): CinemaAgenda[] {
    const out: CinemaAgenda[] = [];
    for (const s of film.screenings) {
      if (this.selectedCinema && s.cinema !== this.selectedCinema) continue;
      if (this.therinosOnly && !s.openAir) continue;
      const days = s.sessions.filter((x) => x.date >= this.today);
      if (days.length) out.push({ cinema: s.cinema, hall: s.hall, days });
    }
    return out;
  }

  get filteredFilms(): IFilm[] {
    const q = this.query.trim().toLowerCase();

    const matches = this.films.filter((f) => {
      if (q) {
        const haystack =
          `${f.title} ${f.originalTitle ?? ''} ${f.director ?? ''} ${(f.cast ?? []).join(' ')}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (this.selectedCity && f.city !== this.selectedCity) return false;
      if (this.selectedGenre && !f.genres.includes(this.selectedGenre)) return false;
      if (this.selectedCinema && !f.cinemas.includes(this.selectedCinema)) return false;
      // With a specific day chosen, only keep films that actually screen that day.
      if (this.selectedDate && this.showtimesOn(f, this.selectedDate).length === 0) return false;
      // "All dates" still hides films whose screenings are all in the past.
      if (!this.selectedDate && this.agenda(f).length === 0) return false;
      return true;
    });

    return matches.sort((a, b) => {
      switch (this.sortKey) {
        case 'rating':
          return (b.rating ?? -1) - (a.rating ?? -1);
        case 'year':
          return (b.year ?? 0) - (a.year ?? 0);
        default:
          return a.title.localeCompare(b.title, 'el');
      }
    });
  }

  get totalCount(): number {
    return this.films.length;
  }

  clearFilters(): void {
    this.query = '';
    this.selectedGenre = '';
    this.selectedCinema = '';
    this.selectedCity = '';
    this.therinosOnly = false;
    this.sortKey = 'rating';
    this.selectedDate = this.defaultDate();
  }

  /** Colour-codes the rating badge: green good, amber middling, red poor. */
  ratingClass(rating?: number): string {
    if (rating === undefined) return '';
    if (rating >= 7) return 'rating-good';
    if (rating >= 5) return 'rating-mid';
    return 'rating-bad';
  }
}
