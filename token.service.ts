import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Create a room on LiveKit server
   */
  createRoom(): Observable<{ roomId: string; message: string }> {
    return this.http.post<{ roomId: string; message: string }>(
      `${this.baseUrl}/create-room`,
      {}
    );
  }

  /**
   * Request LiveKit Token from Backend
   */
  getToken(
    roomId: string,
    candidateName: string
  ): Observable<{ token: string }> {
    return this.http.get<{ token: string }>(
      `${this.baseUrl}/token?room=${roomId}&identity=${candidateName}`
    );
  }

}
