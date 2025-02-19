import { UrlConstants } from './../constants/url.constant';
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  filter,
  Observable,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service';
import {
  AdminApiTokenApiClient,
  AuthenticatedResult,
  TokenRequest,
} from '../../api/admin-api.service.generated';
import { Router } from '@angular/router';
import { AlertService } from '../services/alert.service';
import { BroadcastService } from '../services/broadcast.service';
const TOKEN_HEADER_KEY = 'Authorization'; // for Spring Boot back-end

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  refreshTokenInProgress = false;
  tokenRefreshedSource = new Subject();
  tokenRefreshed$ = this.tokenRefreshedSource.asObservable();

  constructor(
    private router: Router,
    private tokenService: TokenStorageService,
    private tokenApiClient: AdminApiTokenApiClient,
    private alertService: AlertService,
    private broadcastService: BroadcastService
  ) {}

  addAuthHeader(request) {
    const authHeader = this.tokenService.getToken();
    if (authHeader) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${authHeader}`,
        },
      });
    }
  }

  refreshToken(): Observable<any> {
    if (this.refreshTokenInProgress) {
      return new Observable((observer) => {
        this.tokenRefreshed$.subscribe(() => {
          observer.next();
          observer.complete();
        });
      });
    } else {
      this.refreshTokenInProgress = true;
      const token = this.tokenService.getToken();
      const refreshToken = this.tokenService.getRefreshToken();
      var tokenRequest = new TokenRequest({
        accessToken: token!,
        refreshToken: refreshToken!,
      });
      return this.tokenApiClient.refresh(tokenRequest).pipe(
        tap((res: AuthenticatedResult) => {
          this.refreshTokenInProgress = false;
          this.tokenService.saveToken(res.token!);
          this.tokenService.saveRefreshToken(res.refreshToken!);
          this.tokenRefreshedSource.next(res.token);
        }),
        catchError((error) => {
          this.refreshTokenInProgress = false;
          this.logout();
          return throwError(() => new Error(error));
        })
      );
    }
  }

  logout() {
    this.tokenService.signOut();
    this.router.navigate([UrlConstants.LOGIN]);
  }

  async handleResponseError(error, request?, next?) {
    if (error.status === 400) {
      const errMessage = await new Response(error.error).text();
      this.alertService.showError(errMessage);
      this.broadcastService.httpError.next(true);
    } else if (error.status === 401) {
      return this.refreshToken().pipe(
        switchMap(() => {
          request = this.addAuthHeader(request);
          return next.handle(request);
        }),
        catchError((e) => {
          if (e.status !== 401) {
            return this.handleResponseError(e);
          } else {
            this.logout();
          }
        })
      );
    } else if (error.status === 403) {
      this.logout();
      this.broadcastService.httpError.next(true);
    } else if (error.status === 500) {
      this.alertService.showError(
        'Hệ thống có lỗi xảy ra. Vui lòng liên hệ admin'
      );
      this.broadcastService.httpError.next(true);
    }
    return throwError(() => new Error(error));
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // Handle request
    request = this.addAuthHeader(request);

    // Handle response
    return next.handle(request).pipe(
      catchError((error) => {
        return this.handleResponseError(error, request, next);
      })
    );
  }
}
