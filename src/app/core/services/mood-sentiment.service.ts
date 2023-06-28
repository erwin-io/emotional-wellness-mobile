import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { MoodEntity } from '../model/journal-entry.model';

@Injectable({
  providedIn: 'root'
})
export class MoodSentimentService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) {}

  getSentimentAnalysis(params: any): Observable<ApiResponse<MoodEntity>> {
    return this.http
      .get<any>(
        environment.apiBaseUrl + this.appconfig.config.apiEndPoints.moodSentiment.getSentimentAnalysis,
        {params}  
      )
      .pipe(
        tap((_) => this.log('mood-sentiment')),
        catchError(this.handleError('mood-sentiment', []))
      );
  }

  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.log(
        `${operation} failed: ${
          Array.isArray(error.error.message)
            ? error.error.message[0]
            : error.error.message
        }`
      );
      return of(error.error as T);
    };
  }

  log(message: string) {
    console.log(message);
  }
}
