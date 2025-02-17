import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import {
  AdminApiPostApiClient,
  PostActivityLogDto,
} from '../../../api/admin-api.service.generated';

@Component({
  templateUrl: 'post-activity-log.component.html',
})
export class PostActivityLogComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  // Default
  public blockedPanelDetail: boolean = false;
  public title: string;
  public btnDisabled = false;
  public saveBtnName: string;
  public items: any[] = [];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private postService: AdminApiPostApiClient
  ) {}

  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.close();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  ngOnInit(): void {
    this.toggleBlockUI(true);
    this.postService
      .getActivityLogs(this.config?.data?.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: PostActivityLogDto[]) => {
          this.items = response || [];
          this.toggleBlockUI(false);
        },
        error: () => {
          this.toggleBlockUI(false);
        },
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
