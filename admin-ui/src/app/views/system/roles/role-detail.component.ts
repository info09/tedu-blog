import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  AdminApiRoleApiClient,
  RoleDto,
} from '../../../api/admin-api.service.generated';
import { UtilityService } from '../../../shared/services/utility.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-role-detail',
  templateUrl: './role-detail.component.html',
})
export class RoleDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  // Default
  public blockedPanelDetail: boolean = false;
  public form: FormGroup;
  public title: string;
  public btnDisabled = false;
  public saveBtnName: string;
  public closeBtnName: string;
  selectedEntity = {} as RoleDto;
  formSavedEventEmitter: EventEmitter<any> = new EventEmitter();

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private roleService: AdminApiRoleApiClient,
    private utilService: UtilityService,
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
    if (this.utilService.isEmpty(this.config?.data?.id)) {
      this.saveBtnName = 'Thêm';
      this.closeBtnName = 'Đóng';
    } else {
      this.loadDetail(this.config?.data?.id);
      this.saveBtnName = 'Cập nhật';
      this.closeBtnName = 'Đóng';
    }
  }

  // Validate
  noSpecial: RegExp = /^[^<>*!_~]+$/;
  validationMessages = {
    name: [
      { type: 'required', message: 'Bạn phải nhập tên quyền' },
      { type: 'minlength', message: 'Bạn phải nhập ít nhất 3 kí tự' },
      { type: 'maxlength', message: 'Bạn không được nhập quá 255 kí tự' },
    ],
    displayName: [{ type: 'required', message: 'Bạn phải tên hiển thị' }],
  };

  buildForm() {
    this.form = this.fb.group({
      name: new FormControl(
        this.selectedEntity.name || null,
        Validators.compose([
          Validators.required,
          Validators.maxLength(255),
          Validators.minLength(3),
        ])
      ),
      displayName: new FormControl(
        this.selectedEntity.displayName || null,
        Validators.required
      ),
    });
  }

  saveChange() {
    this.toggleBlockUI(true);
    this.saveData();
  }

  private saveData() {
    if (this.utilService.isEmpty(this.config?.data?.id)) {
      this.roleService
        .createRole(this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.ref.close(this.form.value);
          this.toggleBlockUI(false);
        });
    } else {
      this.roleService
        .updateRole(this.config?.data?.id, this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.ref.close(this.form.value);
          this.toggleBlockUI(false);
        });
    }
  }

  loadDetail(id: string) {
    this.toggleBlockUI(true);
    this.roleService
      .getRoleById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: RoleDto) => {
          this.selectedEntity = res;
          this.buildForm();
          this.toggleBlockUI(false);
        },
        error: () => {
          this.toggleBlockUI(false);
        },
      });
  }

  private toggleBlockUI(enabled: boolean) {
    if (enabled == true) {
      this.blockedPanelDetail = true;
    } else {
      setTimeout(() => {
        this.blockedPanelDetail = false;
      }, 1000);
    }
  }
}
