import { Component, OnInit, signal } from '@angular/core';
import { IFilm } from '../../../interfaces/IFilm';
import { FILMS, SCRAPED_AT } from './films.data';

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

  readonly genres = signal<string[]>([]);
  readonly cinemas = signal<string[]>([]);
  /** Distinct upcoming ISO dates anything screens on. */
  readonly availableDates = signal<string[]>([]);

  // Two-way bound via [(ngModel)], so kept as plain properties.
  query = '';
  selectedGenre = '';
  selectedCinema = '';
  /** '' = every upcoming day; otherwise an ISO date. */
  selectedDate = '';
  sortKey: SortKey = 'rating';
  /** Open-air (θερινός) cinemas only. */
  therinosOnly = false;

  readonly today = this.toIso(new Date());

  ngOnInit(): void {
    this.genres.set(this.distinct(this.films.flatMap((f) => f.genres)));
    this.cinemas.set(this.distinct(this.films.flatMap((f) => f.cinemas)));

    // Only surface today onward — past screenings aren't useful.
    this.availableDates.set(
      this.distinct(this.films.flatMap((f) => f.dates))
        .filter((d) => d >= this.today)
        .sort(),
    );

    this.selectedDate = this.defaultDate();
  }

  private distinct(values: string[]): string[] {
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'el'));
  }

  private toIso(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /** Today if anything plays today, else the next day that has screenings. */
  private defaultDate(): string {
    const dates = this.availableDates();
    return dates.includes(this.today) ? this.today : dates[0] ?? '';
  }

  get tomorrow(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return this.toIso(d);
  }

  setDate(date: string): void {
    this.selectedDate = date;
  }

  /**
   * Open-air summer cinemas carry "Θερινός/Θερινό/Θερινού" in their name.
   * Matched on the unaccented stem so it's immune to accent-codepoint vari/normalisation.
   */
  isTherinos(cinema: string): boolean {
    return cinema.includes('Θεριν');
  }

  /** Friendly label for a date chip / option: "Today", "Tomorrow" or "Sat 7 Jun". */
  dateLabel(iso: string): string {
    if (iso === this.today) return 'Today';
    if (iso === this.tomorrow) return 'Tomorrow';
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
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
      if (this.therinosOnly && !this.isTherinos(s.cinema)) continue;
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
      if (this.therinosOnly && !this.isTherinos(s.cinema)) continue;
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
