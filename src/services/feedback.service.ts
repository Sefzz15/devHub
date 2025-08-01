import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IFeedback } from '../interfaces/IFeedback';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  private _url = 'https://localhost:5000/api/feedback';

  constructor(
    private _http: HttpClient
  ) { }

  // Get all feedbacks
  getFeedbacks(): Observable<any[]> {
    return this._http.get<any[]>(`${this._url}`);
  }

  // Get a specific feedback by ID
  getFeedback(id: number): Observable<any> {
    return this._http.get<any>(`${this._url}/${id}`);
  }


  // Create a new feedback
  createFeedback(feedback: IFeedback): Observable<IFeedback> {
    return this._http.post<IFeedback>(`${this._url}`, feedback);
  }

  // Update an existing feedback
  updateFeedback(id: number, feedback: IFeedback): Observable<IFeedback> {
    return this._http.put<IFeedback>(`${this._url}/${id}`, feedback);
  }

  // Delete a feedback
  deleteFeedback(id: number): Observable<any> {
    return this._http.delete<any>(`${this._url}/${id}`);
  }
}
