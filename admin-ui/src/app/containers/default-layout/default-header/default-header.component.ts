import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { ClassToggleService, HeaderComponent } from '@coreui/angular';
import { TokenStorageService } from '../../../shared/services/token-storage.service';
import { Router } from '@angular/router';
import { UrlConstants } from '../../../shared/constants/url.constant';
import { environment } from '../../../../environment/environment';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
})
export class DefaultHeaderComponent extends HeaderComponent implements OnInit {
  @Input() sidebarId: string = 'sidebar';

  public newMessages = new Array(4);
  public newTasks = new Array(5);
  public newNotifications = new Array(5);
  public avatarImage: string = '';

  constructor(
    private classToggler: ClassToggleService,
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {
    super();
  }
  ngOnInit(): void {
    this.avatarImage =
      environment.API_URL + this.tokenStorage.getUser()?.avatar;
  }

  logout() {
    this.tokenStorage.signOut();
    this.router.navigate([UrlConstants.LOGIN]);
  }
}
