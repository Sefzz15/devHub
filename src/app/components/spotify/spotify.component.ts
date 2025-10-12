import { Component, OnInit, ViewChild } from '@angular/core';
import { ISpotifyPaginated, ISpotifyValuesResponse } from '../../../interfaces/ISpotify';
import { SessionService } from '../../../services/session.service';
import { SpotifyService } from '../../../services/spotify.service';
import { HttpClient } from '@angular/common/http';
import { Column } from '../../../interfaces/ISpotify';
import { ISpotifyFilters, ITopArtistDto, ITopTrackDto } from '../../../interfaces/ISpotify';

@Component({
  selector: 'app-spotify',
  standalone: false,

  templateUrl: './spotify.component.html',
  styleUrls: ['./spotify.component.css', '../admin/admin.component.css']
})
export class SpotifyComponent implements OnInit {

  columns: Column[] = [
    { key: 'id', label: 'ID', visible: true },
    { key: 'ts', label: 'Timestamp', visible: true },
    { key: 'master_metadata_track_name', label: 'Track Name', visible: true },
    { key: 'master_metadata_album_artist_name', label: 'Album Artist', visible: true },
    { key: 'master_metadata_album_album_name', label: 'Album Name', visible: true },
    { key: 'spotify_track_uri', label: 'Spotify URI', visible: true },
    { key: 'platform', label: 'Platform', visible: false },
    { key: 'ms_played', label: 'msPlayed', visible: false },
    { key: 'conn_country', label: 'Country', visible: false },
    { key: 'ip_addr', label: 'IP Address', visible: false },
    { key: 'episode_name', label: 'Episode Name', visible: false },
    { key: 'episode_show_name', label: 'Episode Show', visible: false },
    { key: 'spotify_episode_uri', label: 'Episode URI', visible: false },
    { key: 'audiobook_title', label: 'Audiobook Title', visible: false },
    { key: 'audiobook_uri', label: 'Audiobook URI', visible: false },
    { key: 'audiobook_chapter_uri', label: 'Chapter URI', visible: false },
    { key: 'audiobook_chapter_title', label: 'Chapter Title', visible: false },
    { key: 'reason_start', label: 'Reason Start', visible: false },
    { key: 'reason_end', label: 'Reason End', visible: false },
    { key: 'shuffle', label: 'Shuffle', visible: false },
    { key: 'skipped', label: 'Skipped', visible: false },
    { key: 'offline', label: 'Offline', visible: false },
    { key: 'offline_timestamp', label: 'Offline Timestamp', visible: false },
    { key: 'incognito_mode', label: 'Incognito', visible: false },
  ];

filters: ISpotifyFilters = { type: 'all', dateFrom: null, dateTo: null, minMs: 0, query: '' };
topTracks: ITopTrackDto[] = [];
topArtists: ITopArtistDto[] = [];
countBy: 'time' | 'plays' = 'time';

  totalItems = 0;
  pageSize = 100;
  currentPage = 1;
  spotifyList: ISpotifyValuesResponse[] = [];
  currentSortColumn: string = '';
  currentSortDirection: 'asc' | 'desc' = 'asc';


  constructor(
    private _sessionService: SessionService,
    private _spotifyService: SpotifyService,
    private _http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.loadPage(this.currentPage, this.pageSize);
    this.loadInsights();
  }

  // getAllSpotify(): void {
  //   this._spotifyService.getAllSpotify().subscribe(
  //     (data: ISpotifyValuesResponse[]) => {
  //       this.spotifyList = data;
  //       console.log('Fetched spotify history:', this.spotifyList);
  //     },
  //     (error: any) => {
  //       console.error('Error fetching spotify history:', error);
  //     }
  //   );
  // }

  loadPage(page: number, pageSize: number): void {
    this._spotifyService
      .getPage(page, pageSize, this.currentSortColumn || undefined, this.currentSortDirection, this.filters)
      .subscribe((response) => {
        this.spotifyList = response.items;
        this.totalItems = response.totalItems;
        this.currentPage = response.page;
        this.pageSize = response.pageSize;
      });
  }

  onPageChange(newPage: number) {
    this.loadPage(newPage, this.pageSize);
    this.loadInsights();
  }

  onInspect(item: ISpotifyValuesResponse): void {
    console.log('Inspecting item:', item);
  }

  extractSpotifyId(uri: string): string {
    const parts = uri.split(':');
    return parts.length === 3 ? parts[2] : '';
  }

  onSort(column: string): void {
    if (this.currentSortColumn === column) {
      this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortColumn = column;
      this.currentSortDirection = 'asc';
    }
    this.loadPage(1, this.pageSize);
    this.loadInsights();
  }

  applyPreset(preset: string) {
    this.columns.forEach(col => {
      if (preset === 'simple') {
        col.visible = ['id', 'ts', 'master_metadata_track_name'].includes(col.key);
      } else if (preset === 'songs') {
        col.visible = [
          'id',
          'ts',
          'master_metadata_track_name',
          'master_metadata_album_artist_name',
          'master_metadata_album_album_name',
          'spotify_track_uri',
          'ms_played',
        ].includes(col.key);
      } else if (preset === 'podcasts') {
        col.visible = [
          'id',
          'ts',
          'episode_name',
          'episode_show_name',
          'spotify_episode_uri',
          'ms_played',
        ].includes(col.key);
      }
    });
  }

  setRange(range: '4w' | '6m' | '12m') {
  const today = new Date();
  const to = today.toISOString().slice(0,10);
  const fromDate = new Date(today);
  if (range === '4w') fromDate.setDate(today.getDate() - 28);
  if (range === '6m') fromDate.setMonth(today.getMonth() - 6);
  if (range === '12m') fromDate.setFullYear(today.getFullYear() - 1);

  this.filters.dateFrom = fromDate.toISOString().slice(0,10);
  this.filters.dateTo = to;
  this.loadPage(1, this.pageSize);
  this.loadInsights();
}

toggleCountBy() {
  this.countBy = this.countBy === 'time' ? 'plays' : 'time';
  this.loadInsights();
}

// small formatter for durations (if you want to show TotalMs per item)
fmtMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h ? `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2,'0')}` : `${m}:${sec.toString().padStart(2,'0')}`;
}

// update loadInsights to use countBy
loadInsights(): void {
  this._spotifyService.topTracks(10, this.countBy, this.filters).subscribe((d: ITopTrackDto[]) => this.topTracks = d);
  this._spotifyService.topArtists(10, this.countBy, this.filters).subscribe((d: ITopArtistDto[]) => this.topArtists = d);
}

// handy: clear everything
resetFilters() {
  this.filters = { type: 'all', dateFrom: null, dateTo: null, minMs: 0, query: '' };
  this.countBy = 'time';
  this.loadPage(1, this.pageSize);
  this.loadInsights();
}

  isColumnVisible(key: string): boolean {
    return this.columns.find(c => c.key === key)?.visible ?? false;
  }

  toggleColumn(key: string) {
    const col = this.columns.find(c => c.key === key);
    if (col) col.visible = !col.visible;
  }
}