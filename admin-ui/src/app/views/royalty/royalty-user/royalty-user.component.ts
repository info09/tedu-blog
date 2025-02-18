import { MessageConstants } from './../../../shared/constants/message.constant';
import { AlertService } from './../../../shared/services/alert.service';
import {
  AdminApiRoyaltyApiClient,
  RoyaltyReportByUserDto,
} from './../../../api/admin-api.service.generated';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { ConfirmationService } from 'primeng/api';

@Component({
  templateUrl: './royalty-user.component.html',
})
export class RoyaltyUserComponent implements OnInit, OnDestroy {
  //System variables
  private ngUnsubscribe = new Subject<void>();
  public blockedPanel: boolean = false;
  public items: RoyaltyReportByUserDto[] = [];
  public userName: string = '';
  public fromMonth: number = 1;
  public fromYear: number = new Date().getFullYear();
  public toMonth: number = 12;
  public toYear: number = new Date().getFullYear();

  constructor(
    private royaltyService: AdminApiRoyaltyApiClient,
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
    this.royaltyService
      .getRoyaltyReportByUser(
        this.userName,
        this.fromMonth,
        this.fromYear,
        this.toMonth,
        this.toYear
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: RoyaltyReportByUserDto[]) => {
          this.items = res;
          this.toggleBlockUI(false);
        },
        error: () => {
          this.toggleBlockUI(false);
        },
      });
  }

  payForUser(userId: string) {
    this.confirmationService.confirm({
      message: 'Bạn có muốn thanh toán không?',
      accept: () => {
        this.payConfirm(userId);
      },
    });
  }

  payConfirm(id: string) {
    this.toggleBlockUI(true);
    this.royaltyService
      .payRoyalty(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.alertService.showSuccess(MessageConstants.UPDATED_OK_MSG);
          this.loadData();
          this.toggleBlockUI(false);
        },
        error: () => {
          this.toggleBlockUI(false);
        },
      });
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
