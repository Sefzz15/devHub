import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IFeedback, IFeedbackValuesResponse } from '../interfaces/IFeedback';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  private _url = '/api/feedback';

  private readonly _http = inject(HttpClient);

  // Get all feedbacks
  getFeedbacks(): Observable<IFeedbackValuesResponse[]> {
    return this._http.get<IFeedbackValuesResponse[]>(`${this._url}`);
  }

  // Create a new feedback
  createFeedback(feedback: IFeedback): Observable<IFeedback> {
    return this._http.post<IFeedback>(`${this._url}`, feedback);
  }

  // Delete a feedback
  deleteFeedback(id: number): Observable<any> {
    return this._http.delete<any>(`${this._url}/${id}`);
  }
}
