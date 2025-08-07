import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ISpotifyPaginated, ISpotifyValuesResponse } from '../interfaces/ISpotify';

@Injectable({
    providedIn: 'root'
})
export class SpotifyService {

    private _url = 'https://localhost:5000/api/spotify';

    constructor(
        private http: HttpClient
    ) { }

    // Get all spotifies
    getAllSpotify(): Observable<ISpotifyValuesResponse[]> {
        return this.http.get<ISpotifyValuesResponse[]>(`${this._url}`);
    }

    // Get a specific spotify by ID
    getSpotify(id: number): Observable<ISpotifyPaginated> {
        return this.http.get<ISpotifyPaginated>(`${this._url}/${id}`);
    }

    // Create a new spotify
    createSpotify(spotify: ISpotifyPaginated): Observable<ISpotifyPaginated> {
        return this.http.post<ISpotifyPaginated>(`${this._url}`, spotify);
    }

    // Update an existing spotify
    updateSpotify(id: number, spotify: ISpotifyPaginated): Observable<ISpotifyPaginated> {
        return this.http.put<ISpotifyPaginated>(`${this._url}/${id}`, spotify);
    }

    // Delete a spotify
    deleteSpotify(id: number): Observable<any> {
        return this.http.delete<any>(`${this._url}/${id}`);
    }
}
