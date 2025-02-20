import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  AdminApiAuthApiClient,
  AuthenticatedResult,
  LoginRequest,
} from '../../../api/admin-api.service.generated';
import { AlertService } from '../../../shared/services/alert.service';
import { Router } from '@angular/router';
import { TokenStorageService } from '../../../shared/services/token-storage.service';
import { UrlConstants } from '../../../shared/constants/url.constant';
import { Subject, takeUntil } from 'rxjs';
import { BroadcastService } from '../../../shared/services/broadcast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  private ngUnsubscribe = new Subject<void>();
  loading = false;
  constructor(
    private fb: FormBuilder,
    private authApiClient: AdminApiAuthApiClient,
    private alertService: AlertService,
    private router: Router,
    private tokenStorage: TokenStorageService,
    private broadcastService: BroadcastService
  ) {
    this.loginForm = this.fb.group({
      userName: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }
  ngOnInit(): void {
    this.broadcastService.httpError.asObservable().subscribe((value) => {
      this.loading = false;
    });
  }
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  login() {
    this.loading = true;
    var request: LoginRequest = new LoginRequest({
      userName: this.loginForm.controls['userName']?.value,
      password: this.loginForm.controls['password']?.value,
    });

    this.authApiClient
      .login(request)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: AuthenticatedResult) => {
          this.tokenStorage.saveToken(res.token!);
          this.tokenStorage.saveRefreshToken(res.refreshToken!);
          this.tokenStorage.saveUser(res);
          this.router.navigate([UrlConstants.HOME]);
        },
        error: (error: Error) => {
          this.alertService.showError('Login Invalid');
          this.loading = false;
        },
      });
  }
}
