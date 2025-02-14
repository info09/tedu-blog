import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AdminApiUserApiClient,
  UserDto,
  UserDtoPagedResult,
} from '../../../api/admin-api.service.generated';
import { Subject, takeUntil } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { AlertService } from '../../../shared/services/alert.service';
import { ConfirmationService } from 'primeng/api';
import { UserDetailComponent } from './user-detail.component';
import { MessageConstants } from '../../../shared/constants/message.constant';
import { ChangeEmailComponent } from './change-email.component';
import { SetPasswordComponent } from './set-password.component';
import { RoleAssignComponent } from './role-assign.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
})
export class UserComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  public blockedPanel: boolean = false;
  //Paging variables
  public pageIndex: number = 1;
  public pageSize: number = 10;
  public totalCount: number | undefined;
  //Business variables
  public items: UserDto[];
  public selectedItems: UserDto[] = [];
  public keyword: string = '';

  constructor(
    private userService: AdminApiUserApiClient,
    private dialogService: DialogService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService
  ) {}
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.toggleBlockUI(true);
    this.userService
      .getUsersPaging(this.keyword, this.pageIndex, this.pageSize)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: UserDtoPagedResult) => {
          this.items = res.items || [];
          this.totalCount = res.rowCount;
          this.toggleBlockUI(false);
        },
      });
  }

  showAddModal() {
    const ref = this.dialogService.open(UserDetailComponent, {
      header: 'Thêm mới người dùng',
      width: '70%',
    });
    ref.onClose.subscribe((data: UserDto) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.CREATED_OK_MSG);
        this.loadData();
        this.selectedItems = [];
      }
    });
  }

  deleteItems() {
    if (this.selectedItems.length == 0) {
      this.alertService.showError(MessageConstants.NOT_CHOOSE_ANY_RECORD);
      return;
    }

    var ids = this.selectedItems?.map((el) => el.id) || [];

    this.confirmationService.confirm({
      message: MessageConstants.CONFIRM_DELETE_MSG,
      accept: () => {
        this.deleteItemsConfirm(ids);
      },
    });
  }

  deleteItemsConfirm(ids: any[]) {
    this.userService
      .deleteUsers(ids)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.alertService.showSuccess(MessageConstants.DELETED_OK_MSG);
        this.loadData();
        this.selectedItems = [];
        this.toggleBlockUI(false);
      });
  }

  showEditModal() {
    if (this.selectedItems.length == 0) {
      this.alertService.showError(MessageConstants.NOT_CHOOSE_ANY_RECORD);
      return;
    }
    var id = this.selectedItems[0].id;
    const ref = this.dialogService.open(UserDetailComponent, {
      data: {
        id: id,
      },
      header: 'Cập nhật quyền',
      width: '70%',
    });
    ref.onClose.subscribe((data: UserDto) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.UPDATED_OK_MSG);
        this.selectedItems = [];
        this.loadData();
      }
    });
  }

  setPassword(id: string) {
    const ref = this.dialogService.open(SetPasswordComponent, {
      data: {
        id: id,
      },
      header: 'Cập nhật email',
      width: '70%',
    });
    ref.onClose.subscribe((result: boolean) => {
      if (result) {
        this.alertService.showSuccess(
          MessageConstants.CHANGE_PASSWORD_SUCCCESS_MSG
        );
        this.selectedItems = [];
        this.loadData();
      }
    });
  }

  changeEmail(id: string) {
    const ref = this.dialogService.open(ChangeEmailComponent, {
      data: {
        id: id,
      },
      header: 'Cập nhật email',
      width: '70%',
    });
    ref.onClose.subscribe((result: boolean) => {
      if (result) {
        this.alertService.showSuccess(
          MessageConstants.CHANGE_EMAIL_SUCCCESS_MSG
        );
        this.selectedItems = [];
        this.loadData();
      }
    });
  }

  assignRole(id: string) {
    const ref = this.dialogService.open(RoleAssignComponent, {
      data: {
        id: id,
      },
      header: 'Gán quyền',
      width: '70%',
    });
    ref.onClose.subscribe((result: boolean) => {
      if (result) {
        this.alertService.showSuccess(MessageConstants.ROLE_ASSIGN_SUCCESS_MSG);
        this.loadData();
      }
    });
  }

  pageChanged(event: any): void {
    this.pageIndex = event.page;
    this.pageSize = event.rows;
    this.loadData();
  }

  private toggleBlockUI(enabled: boolean) {
    if (enabled == true) {
      this.blockedPanel = true;
    } else {
      setTimeout(() => {
        this.blockedPanel = false;
      }, 1000);
    }
  }
}
