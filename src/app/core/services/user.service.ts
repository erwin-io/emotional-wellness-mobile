import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiResponse } from '../model/api-response.model';
import { environment } from '../../../environments/environment';
import { IServices } from './interface/iservices';
import { AppConfigService } from './app-config.service';
import { User } from '../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  getCustomerByAdvanceSearch(params: {
    isAdvance: boolean;
    keyword: string;
    userId: string;
    email: string;
    mobileNumber: number;
    name: string;
  }): Observable<ApiResponse<User[]>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.user.getCustomerByAdvanceSearch,
      {params})
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  getById(userId: string): Observable<ApiResponse<User>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.user.getById + userId)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  udpdateUser(data: any): Observable<ApiResponse<User>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.user.updateUser, data)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  changePassword(data: any): Observable<ApiResponse<User>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.user.changePassword, data)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  updateFirebaseToken(data: any): Observable<ApiResponse<User>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.user.updateFirebaseToken, data)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }
  updateProfilePicture(data: any){
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.user.updateProfilePicture, data)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  updatePetCompanion(data: any): Observable<ApiResponse<User>> {
    return this.http
      .put<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.user.updatePetCompanion,
        data
      )
      .pipe(
        tap((_) => this.log('pet')),
        catchError(this.handleError('pet', []))
      );
  }

  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.log(`${operation} failed: ${Array.isArray(error.error.message) ? error.error.message[0] : error.error.message}`);
      return of(error.error as T);
    };
  }

  log(message: string) {
    console.log(message);
  }
}
