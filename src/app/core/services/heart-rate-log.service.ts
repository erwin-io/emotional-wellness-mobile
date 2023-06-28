import { Injectable } from '@angular/core';
import { HeartRateLog } from '../model/heart-rate-logs.model';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class HeartRateLogService implements IServices {
  constructor(private http: HttpClient, private appconfig: AppConfigService) {}

  findByDate(params: any): Observable<ApiResponse<HeartRateLog[]>> {
    return this.http
      .get<any>(
        environment.apiBaseUrl + this.appconfig.config.apiEndPoints.heartRateLog.findByDate,
        {params}
      )
      .pipe(
        tap((_) => this.log('heart-rate-log')),
        catchError(this.handleError('heart-rate-log', []))
      );
  }

  getHeartRateStatus(params: any): Observable<ApiResponse<HeartRateLog[]>> {
    return this.http
      .get<any>(
        environment.apiBaseUrl + this.appconfig.config.apiEndPoints.heartRateLog.getHeartRateStatus,
        {params}
      )
      .pipe(
        tap((_) => this.log('heart-rate-log')),
        catchError(this.handleError('heart-rate-log', []))
      );
  }

  getById(heartRateLogId: string): Observable<ApiResponse<HeartRateLog>> {
    return this.http
      .get<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.heartRateLog.getById +
          heartRateLogId
      )
      .pipe(
        tap((_) => this.log('heart-rate-log')),
        catchError(this.handleError('heart-rate-log', []))
      );
  }

  add(data: any): Observable<ApiResponse<HeartRateLog>> {
    return this.http
      .post<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.heartRateLog.add,
        data
      )
      .pipe(
        tap((_) => this.log('heart-rate-log')),
        catchError(this.handleError('heart-rate-log', []))
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
