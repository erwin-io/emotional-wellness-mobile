import { Injectable } from '@angular/core';
import { JournalEntry, JournalEntrySummary, JournalEntryWeeklySummary } from '../model/journal-entry.model';
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
export class JournalEntryService implements IServices {
  constructor(private http: HttpClient, private appconfig: AppConfigService) {}

  findByDate(params: any): Observable<ApiResponse<JournalEntry[]>> {
    return this.http
      .get<any>(
        environment.apiBaseUrl + this.appconfig.config.apiEndPoints.journalEntry.findByDate,
        {params}
      )
      .pipe(
        tap((_) => this.log('journal-entry')),
        catchError(this.handleError('journal-entry', []))
      );
  }

  getDateSummary(params: any): Observable<ApiResponse<JournalEntrySummary>> {
    return this.http
      .get<any>(
        environment.apiBaseUrl + this.appconfig.config.apiEndPoints.journalEntry.getDateSummary,
        {params}
      )
      .pipe(
        tap((_) => this.log('journal-entry')),
        catchError(this.handleError('journal-entry', []))
      );
  }

  getWeeklySummary(params: any): Observable<ApiResponse<JournalEntryWeeklySummary>> {
    return this.http
      .get<any>(
        environment.apiBaseUrl + this.appconfig.config.apiEndPoints.journalEntry.getWeeklySummary,
        {params}
      )
      .pipe(
        tap((_) => this.log('journal-entry')),
        catchError(this.handleError('journal-entry', []))
      );
  }

  getWeekly(params: any): Observable<ApiResponse<JournalEntry[]>> {
    return this.http
      .get<any>(
        environment.apiBaseUrl + this.appconfig.config.apiEndPoints.journalEntry.getWeekly,
        {params}
      )
      .pipe(
        tap((_) => this.log('journal-entry')),
        catchError(this.handleError('journal-entry', []))
      );
  }

  getById(journalEntryId: string): Observable<ApiResponse<JournalEntry>> {
    return this.http
      .get<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.journalEntry.getById +
          journalEntryId
      )
      .pipe(
        tap((_) => this.log('journal-entry')),
        catchError(this.handleError('journal-entry', []))
      );
  }

  add(data: any): Observable<ApiResponse<JournalEntry>> {
    return this.http
      .post<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.journalEntry.add,
        data
      )
      .pipe(
        tap((_) => this.log('journal-entry')),
        catchError(this.handleError('journal-entry', []))
      );
  }

  update(data: any): Observable<ApiResponse<JournalEntry>> {
    return this.http
      .put<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.journalEntry.update,
        data
      )
      .pipe(
        tap((_) => this.log('journal-entry')),
        catchError(this.handleError('journal-entry', []))
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
