import { Component, OnInit, ViewChild } from '@angular/core';
import { ISpotifyPaginated, ISpotifyValuesResponse } from '../../../interfaces/ISpotify';
import { SessionService } from '../../../services/session.service';
import { SpotifyService } from '../../../services/spotify.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-spotify',
  standalone: false,

  templateUrl: './spotify.component.html',
  styleUrls: ['./spotify.component.css', '../admin/admin.component.css']
})
export class SpotifyComponent implements OnInit {
  displayedColumns: string[] = ['id', 'ts', 'platform', 'trackName']; // κλπ.
  dataSource = new MatTableDataSource<ISpotifyValuesResponse>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;


  totalItems = 0;
  pageSize = 100;
  currentPage = 1;
  spotifyList: ISpotifyValuesResponse[] = [];

  constructor(
    private _sessionService: SessionService,
    private _spotifyService: SpotifyService,
    private _http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.loadPage(this.currentPage, this.pageSize);

    // this.getSpotifies();
  }

  getSpotifies(): void {
    this._spotifyService.getSpotifies().subscribe(
      (data: ISpotifyValuesResponse[]) => {
        this.spotifyList = data;
        console.log('Fetched spotifies:', this.spotifyList);
      },
      (error: any) => {
        console.error('Error fetching spotifies:', error);
      }
    );
  }

  loadPage(page: number, pageSize: number): void {
    this._http
      .get<ISpotifyPaginated>(`https://localhost:5000/api/spotify?page=${page}&pageSize=${pageSize}`)
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
    // Ή άνοιξε modal, ή μετέφερε σε νέα σελίδα, ή δείξε λεπτομέρειες κ.λπ.
  }

  extractSpotifyId(uri: string): string {
    // Expected format: "spotify:track:5Z01UMMf7V1o0MzF86s6WJ"
    const parts = uri.split(':');
    return parts.length === 3 ? parts[2] : '';
  }


}
