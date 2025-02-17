import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';

@Directive({
  selector: '[appPermission]',
})
export class PermissionDirective implements OnInit {
  @Input() appPolicy;
  constructor(
    private el: ElementRef,
    private tokenService: TokenStorageService
  ) {}
  ngOnInit(): void {
    const loggedInUser = this.tokenService.getUser();
    if (loggedInUser) {
      var listPermissions = JSON.parse(loggedInUser.permissions);
      if (
        listPermissions != null &&
        listPermissions != '' &&
        listPermissions.filter((i) => i === this.appPolicy).length > 0
      ) {
        this.el.nativeElement.style.display = '';
      } else {
        this.el.nativeElement.style.display = 'none';
      }
    } else {
      this.el.nativeElement.style.display = 'none';
    }
  }
}
