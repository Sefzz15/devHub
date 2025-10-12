import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // + HttpParams
import { Observable } from 'rxjs';
import {
    ISpotifyPaginated,
    ISpotifyValuesResponse,
    ISpotifyFilters,
    ITopTrackDto,
    ITopArtistDto
} from '../interfaces/ISpotify';

@Injectable({ providedIn: 'root' })
export class SpotifyService {
    private _url = 'https://localhost:5000/api/spotify';

    constructor(private _http: HttpClient) { }

    // ---- existing methods (unchanged) ----
    getAllSpotify(): Observable<ISpotifyValuesResponse[]> {
        return this._http.get<ISpotifyValuesResponse[]>(`${this._url}`);
    }

    // (Optional: this endpoint returns a single item; adjust type if your API returns the entity)
    getSpotify(id: number): Observable<ISpotifyValuesResponse> {
        return this._http.get<ISpotifyValuesResponse>(`${this._url}/${id}`);
    }

    createSpotify(spotify: ISpotifyPaginated): Observable<ISpotifyPaginated> {
        return this._http.post<ISpotifyPaginated>(`${this._url}`, spotify);
    }
    updateSpotify(id: number, spotify: ISpotifyPaginated): Observable<ISpotifyPaginated> {
        return this._http.put<ISpotifyPaginated>(`${this._url}/${id}`, spotify);
    }
    deleteSpotify(id: number): Observable<any> {
        return this._http.delete<any>(`${this._url}/${id}`);
    }

    // ---- NEW: paging with filters/sort ----
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
        if (filters?.minMs != null) params = params.set('minMs', String(filters.minMs));
        if (filters?.query) params = params.set('query', filters.query);

        return this._http.get<ISpotifyPaginated>(`${this._url}`, { params });
    }

    // ---- NEW: summaries ----
    topTracks(
        limit = 10,
        countBy: 'time' | 'plays' = 'time',
        filters?: ISpotifyFilters
    ): Observable<ITopTrackDto[]> {
        let params = new HttpParams().set('limit', limit).set('countBy', countBy);
        if (filters?.dateFrom) params = params.set('from', filters.dateFrom);
        if (filters?.dateTo) params = params.set('to', filters.dateTo);
        if (filters?.type && filters.type !== 'all') params = params.set('type', filters.type);
        if (filters?.minMs != null) params = params.set('minMs', String(filters.minMs));
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
        if (filters?.minMs != null) params = params.set('minMs', String(filters.minMs));
        if (filters?.query) params = params.set('query', filters.query);

        return this._http.get<ITopArtistDto[]>(`${this._url}/summary/top-artists`, { params });
    }
}
