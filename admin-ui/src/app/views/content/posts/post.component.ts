import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AdminApiPostApiClient,
  AdminApiPostCategoryApiClient,
  AdminApiTestApiClient,
  PostInListDto,
  PostInListDtoPagedResult,
} from '../../../api/admin-api.service.generated';
import { Subject, takeUntil } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { AlertService } from '../../../shared/services/alert.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
})
export class PostComponent implements OnInit, OnDestroy {
  //System variables
  private ngUnsubscribe = new Subject<void>();
  public blockedPanel: boolean = false;
  //Paging variables
  public pageIndex: number = 1;
  public pageSize: number = 10;
  public totalCount: number | undefined;
  //Business variables
  public items: PostInListDto[];
  public selectedItems: PostInListDto[] = [];
  public keyword: string = '';
  public categoryId: string = '';
  public postCategories: any[] = [];
  constructor(
    private postCategoryService: AdminApiPostCategoryApiClient,
    private postService: AdminApiPostApiClient,
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
    this.postService
      .getPostsPaging(
        this.keyword,
        this.categoryId,
        this.pageIndex,
        this.pageSize
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: PostInListDtoPagedResult) => {
          this.items = res.items || [];
          this.totalCount = res.rowCount;
          this.toggleBlockUI(false);
        },
      });
  }
  showAddModal() {}
  showEditModal() {}
  deleteItems() {}

  addToSeries(id: string) {}

  approve(id: string) {}

  sendToApprove(id: string) {}

  reject(id: string) {}

  showLogs(id: string) {}

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
