import { Component, OnInit, ViewChild } from '@angular/core';
import { ISpotifyPaginated, ISpotifyValuesResponse } from '../../../interfaces/ISpotify';
import { SessionService } from '../../../services/session.service';
import { SpotifyService } from '../../../services/spotify.service';
import { HttpClient } from '@angular/common/http';
import { Column } from '../../../interfaces/ISpotify'; 

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
  }

  getAllSpotify(): void {
    this._spotifyService.getAllSpotify().subscribe(
      (data: ISpotifyValuesResponse[]) => {
        this.spotifyList = data;
        console.log('Fetched spotify history:', this.spotifyList);
      },
      (error: any) => {
        console.error('Error fetching spotify history:', error);
      }
    );
  }

  loadPage(page: number, pageSize: number): void {
    const params = [
      `page=${page}`,
      `pageSize=${pageSize}`,
    ];

    if (this.currentSortColumn) {
      params.push(`sortColumn=${this.currentSortColumn}`);
      params.push(`sortDirection=${this.currentSortDirection}`);
    }

    this._http
      .get<ISpotifyPaginated>(`https://localhost:5000/api/spotify?${params.join('&')}`)
      .subscribe((response) => {
        this.spotifyList = response.items;
        this.totalItems = response.totalItems;
        this.currentPage = response.page;
        this.pageSize = response.pageSize;
      });
  }

  onPageChange(newPage: number) {
    this.loadPage(newPage, this.pageSize);
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
      // Toggle direction if same column clicked again
      this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
      console.log(`Sorting by ${column} in ${this.currentSortDirection} order`);
    } else {
      this.currentSortColumn = column;
      this.currentSortDirection = 'asc';
    }
    this.loadPage(1, this.pageSize); // reload data with new sort
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

  isColumnVisible(key: string): boolean {
    return this.columns.find(c => c.key === key)?.visible ?? false;
  }

  toggleColumn(key: string) {
    const col = this.columns.find(c => c.key === key);
    if (col) col.visible = !col.visible;
  }
}




