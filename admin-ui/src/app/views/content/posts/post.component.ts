import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AdminApiPostApiClient,
  AdminApiPostCategoryApiClient,
  AdminApiTestApiClient,
  PostCategoryDto,
  PostDto,
  PostInListDto,
  PostInListDtoPagedResult,
} from '../../../api/admin-api.service.generated';
import { Subject, takeUntil } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { AlertService } from '../../../shared/services/alert.service';
import { ConfirmationService } from 'primeng/api';
import { PostDetailComponent } from './post-detail.component';
import { MessageConstants } from '../../../shared/constants/message.constant';
import { PostReturnReasonComponent } from './post-return-reason.component';
import { PostActivityLogComponent } from './post-activity-log.component';
import { PostSeriesComponent } from './post-series.component';

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
    this.loadProductCategories();
    this.loadData();
  }

  loadProductCategories() {
    this.postCategoryService
      .getAll()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: PostCategoryDto[]) => {
          res.forEach((element) => {
            this.postCategories.push({
              value: element.id,
              label: element.name,
            });
          });
        },
      });
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
  showAddModal() {
    const ref = this.dialogService.open(PostDetailComponent, {
      header: 'Thêm mới bài viết',
      width: '70%',
    });
    ref.onClose.subscribe((data: PostDto) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.CREATED_OK_MSG);
        this.loadData();
        this.selectedItems = [];
      }
    });
  }
  showEditModal() {
    const ref = this.dialogService.open(PostDetailComponent, {
      header: 'Cập nhật bài viết',
      width: '70%',
      data: {
        id: this.selectedItems[0].id,
      },
    });
    ref.onClose.subscribe((data: PostDto) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.CREATED_OK_MSG);
        this.loadData();
        this.selectedItems = [];
      }
    });
  }
  deleteItems() {
    if (this.selectedItems.length === 0) {
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
    this.toggleBlockUI(true);
    this.postService
      .deletePosts(ids)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.alertService.showSuccess(MessageConstants.DELETED_OK_MSG);
          this.selectedItems = [];
          this.loadData();
          this.toggleBlockUI(false);
        },
      });
  }

  addToSeries(id: string) {
    const ref = this.dialogService.open(PostSeriesComponent, {
      data: {
        id: id,
      },
      header: 'Thêm vào series',
      width: '70%',
    });
    ref.onClose.subscribe((data: PostDto) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.UPDATED_OK_MSG);
        this.selectedItems = [];
        this.loadData();
      }
    });
  }

  approve(id: string) {
    this.toggleBlockUI(true);
    this.postService
      .approvePost(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.loadData();
          this.alertService.showSuccess(MessageConstants.UPDATED_OK_MSG);
          this.selectedItems = [];
          this.toggleBlockUI(false);
        },
      });
  }

  sendToApprove(id: string) {
    this.toggleBlockUI(true);
    this.postService
      .sendToApprove(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.loadData();
          this.alertService.showSuccess(MessageConstants.UPDATED_OK_MSG);
          this.selectedItems = [];
          this.toggleBlockUI(false);
        },
      });
  }

  reject(id: string) {
    const ref = this.dialogService.open(PostReturnReasonComponent, {
      header: 'Từ chối bài viết',
      width: '70%',
      data: {
        id: id,
      },
    });
    ref.onClose.subscribe((data: PostDto) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.UPDATED_OK_MSG);
        this.loadData();
        this.selectedItems = [];
      }
    });
  }

  showLogs(id: string) {
    const ref = this.dialogService.open(PostActivityLogComponent, {
      header: 'Lịch sử bài viết',
      width: '70%',
      data: {
        id: id,
      },
    });
    ref.onClose.subscribe((data: PostDto) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.UPDATED_OK_MSG);
        this.loadData();
        this.selectedItems = [];
      }
    });
  }

  pageChanged(event: any): void {
    this.pageIndex = event.page + 1;
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
