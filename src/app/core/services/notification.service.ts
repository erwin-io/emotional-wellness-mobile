/* eslint-disable max-len */
import { Injectable } from '@angular/core';
import { Notifications } from '../model/notification.model';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiResponse } from '../model/api-response.model';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  getAllByUserIdPage(params: any): Observable<ApiResponse<{ items: Notifications[]; meta: { currentPage: number; totalItems: number; totalPages: number} }>> {
    return this.http
      .get<any>(
        environment.apiBaseUrl + this.appconfig.config.apiEndPoints.notification.getAllByUserIdPage,
        {params}
      )
      .pipe(
        tap((_) => this.log('notification')),
        catchError(this.handleError('notification', []))
      );
  }

  getTotalUnreadByUserId(params: any): Observable<ApiResponse<{ total: number }>> {
    return this.http
      .get<any>(
        environment.apiBaseUrl + this.appconfig.config.apiEndPoints.notification.getTotalUnreadByUserId,
        {params}
      )
      .pipe(
        tap((_) => this.log('notification')),
        catchError(this.handleError('notification', []))
      );
  }

  updateReadStatus(data: any): Observable<ApiResponse<{ total: number}>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.notification.updateReadStatus, data)
    .pipe(
      tap(_ => this.log('notification')),
      catchError(this.handleError('notification', []))
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
