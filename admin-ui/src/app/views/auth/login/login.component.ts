import { Component } from '@angular/core';
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
import { TokenStorage } from '../../../shared/services/token-storage.service';
import { UrlConstants } from '../../../shared/constants/url.constant';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private authApiClient: AdminApiAuthApiClient,
    private alertService: AlertService,
    private router: Router,
    private tokenStorage: TokenStorage
  ) {
    this.loginForm = this.fb.group({
      userName: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }

  login() {
    var request: LoginRequest = new LoginRequest({
      userName: this.loginForm.controls['userName']?.value,
      password: this.loginForm.controls['password']?.value,
    });

    this.authApiClient.login(request).subscribe({
      next: (res: AuthenticatedResult) => {
        this.tokenStorage.saveToken(res.token!);
        this.tokenStorage.saveRefreshToken(res.refreshToken!);
        this.tokenStorage.saveUser(res);
        this.router.navigate([UrlConstants.HOME]);
      },
      error: (error: any) => {
        console.log(
          '🚀 ~ LoginComponent ~ this.authApiClient.login ~ error:',
          error
        );
        this.alertService.showError('Login Invalid');
      },
    });
  }
}
