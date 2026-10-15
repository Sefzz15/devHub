import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // + HttpParams
import { Observable } from 'rxjs';
import { ISpotifyPaginated, ISpotifyFilters, ITopTrackDto, ITopArtistDto, ITopGenreDto } from '../interfaces/ISpotify';

@Injectable({ providedIn: 'root' })
export class SpotifyService {
    private _url = '/api/spotify';

    private readonly _http = inject(HttpClient);

    // ---- paging with filters/sort ----
    getPage(
        page: number,
        pageSize: number,
        sortColumn?: string,
        sortDirection: 'asc' | 'desc' = 'asc',
        filters?: ISpotifyFilters
    ): Observable<ISpotifyPaginated> {
        let params = new HttpParams()
            .set('page', page)
            .set('pageSize', pageSize)
            .set('sortDirection', sortDirection);

        if (sortColumn) params = params.set('sortColumn', sortColumn);
        if (filters?.dateFrom) params = params.set('from', filters.dateFrom);
        if (filters?.dateTo) params = params.set('to', filters.dateTo);
        if (filters?.type && filters.type !== 'all') params = params.set('type', filters.type);
        if (filters?.query) params = params.set('query', filters.query);

        return this._http.get<ISpotifyPaginated>(`${this._url}`, { params });
    }

    topTracks(
        limit = 10,
        countBy: 'time' | 'plays' = 'time',
        filters?: ISpotifyFilters
    ): Observable<ITopTrackDto[]> {
        let params = new HttpParams().set('limit', limit).set('countBy', countBy);
        if (filters?.dateFrom) params = params.set('from', filters.dateFrom);
        if (filters?.dateTo) params = params.set('to', filters.dateTo);
        if (filters?.type && filters.type !== 'all') params = params.set('type', filters.type);
        if (filters?.query) params = params.set('query', filters.query);

        return this._http.get<ITopTrackDto[]>(`${this._url}/summary/top-tracks`, { params });
    }

    topArtists(
        limit = 10,
        countBy: 'time' | 'plays' = 'time',
        filters?: ISpotifyFilters
    ): Observable<ITopArtistDto[]> {
        let params = new HttpParams().set('limit', limit).set('countBy', countBy);
        if (filters?.dateFrom) params = params.set('from', filters.dateFrom);
        if (filters?.dateTo) params = params.set('to', filters.dateTo);
        if (filters?.type && filters.type !== 'all') params = params.set('type', filters.type);
        if (filters?.query) params = params.set('query', filters.query);

        return this._http.get<ITopArtistDto[]>(`${this._url}/summary/top-artists`, { params });
    }
    topGenres(
        limit = 10,
        countBy: 'time' | 'plays' = 'time',
        filters?: ISpotifyFilters
    ): Observable<ITopGenreDto[]> {
        let params = new HttpParams().set('limit', limit).set('countBy', countBy);
        if (filters?.dateFrom) params = params.set('from', filters.dateFrom);
        if (filters?.dateTo) params = params.set('to', filters.dateTo);
        if (filters?.type === 'songs') params = params.set('type', 'songs');
        if (filters?.query) params = params.set('query', filters.query);

        return this._http.get<ITopGenreDto[]>(`${this._url}/summary/top-genres`, { params });
    }
}
