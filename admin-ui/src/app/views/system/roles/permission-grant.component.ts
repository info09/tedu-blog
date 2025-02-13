import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  AdminApiRoleApiClient,
  PermissionDto,
  RoleClaimsDto,
} from '../../../api/admin-api.service.generated';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  templateUrl: 'permission-grant.component.html',
})
export class PermissionGrantComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  // Default
  public blockedPanelDetail: boolean = false;
  public form: FormGroup;
  public title: string;
  public btnDisabled = false;
  public saveBtnName: string;
  public closeBtnName: string;
  public permissions: RoleClaimsDto[] = [];
  public selectedPermissions: RoleClaimsDto[] = [];
  public id: string;
  formSavedEventEmitter: EventEmitter<any> = new EventEmitter();

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private roleService: AdminApiRoleApiClient,
    private fb: FormBuilder
  ) {}

  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.close();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  ngOnInit(): void {
    this.buildForm();
    this.loadDetail(this.config?.data?.id);
    this.saveBtnName = 'Cập nhật';
    this.closeBtnName = 'Hủy';
  }

  loadDetail(id: string) {
    this.toggleBlockUI(true);
    this.roleService
      .getAllRolePermissions(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: PermissionDto) => {
          this.permissions = res.roleClaims || [];
          this.buildForm();
          this.toggleBlockUI(false);
        },
      });
  }

  buildForm() {
    this.form = this.fb.group({});
    //Fill value
    for (let index = 0; index < this.permissions.length; index++) {
      const permission = this.permissions[index];
      if (permission.selected) {
        this.selectedPermissions.push(
          new RoleClaimsDto({
            selected: true,
            displayName: permission.displayName,
            type: permission.type,
            value: permission.value,
          })
        );
      }
    }
  }

  saveChange() {
    this.toggleBlockUI(true);
    this.saveData();
  }

  private saveData() {
    var roleClaims: RoleClaimsDto[] = [];
    for (let index = 0; index < this.permissions.length; index++) {
      const isGranted =
        this.selectedPermissions.filter(
          (x) => x.value == this.permissions[index].value
        ).length > 0;
      roleClaims.push(
        new RoleClaimsDto({
          type: this.permissions[index].type,
          selected: isGranted,
          value: this.permissions[index].value,
        })
      );
    }
    var updateValues = new PermissionDto({
      roleId: this.config.data.id,
      roleClaims: roleClaims,
    });

    this.roleService
      .savePermissions(updateValues)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.toggleBlockUI(false);
        this.ref.close(this.form.value);
      });
  }

  private toggleBlockUI(enabled: boolean) {
    if (enabled == true) {
      this.btnDisabled = true;
      this.blockedPanelDetail = true;
    } else {
      setTimeout(() => {
        this.btnDisabled = false;
        this.blockedPanelDetail = false;
      }, 1000);
    }
  }
}
