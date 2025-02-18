import { AlertService } from './../../../shared/services/alert.service';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import {
  AdminApiSeriesApiClient,
  SeriesDto,
  SeriesInListDto,
  SeriesInListDtoPagedResult,
} from './../../../api/admin-api.service.generated';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { SeriesDetailComponent } from './series-detail.component';
import { MessageConstants } from '../../../shared/constants/message.constant';
import { SeriesPostComponent } from './series-post.component';
@Component({
  selector: 'app-series',
  templateUrl: './series.component.html',
})
export class SeriesComponent implements OnInit, OnDestroy {
  //System variables
  private ngUnsubscribe = new Subject<void>();
  public blockedPanel: boolean = false;
  //Paging variables
  public pageIndex: number = 1;
  public pageSize: number = 10;
  public totalCount: number | undefined;
  //Business variables
  public items: SeriesInListDto[];
  public selectedItems: SeriesInListDto[] = [];
  public keyword: string = '';

  constructor(
    private seriesService: AdminApiSeriesApiClient,
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
    this.seriesService
      .getSeriesPaging(this.keyword, this.pageIndex, this.pageSize)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: SeriesInListDtoPagedResult) => {
          this.items = res.items || [];
          this.totalCount = res.rowCount;
          this.toggleBlockUI(false);
        },
        error: () => {
          this.toggleBlockUI(false);
        },
      });
  }

  showPosts() {
    const ref = this.dialogService.open(SeriesPostComponent, {
      data: {
        id: this.selectedItems[0].id,
      },
      header: 'Quản lý danh sách bài viết',
      width: '70%',
    });
    ref.onClose.subscribe((data: SeriesDto) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.CREATED_OK_MSG);
        this.loadData();
        this.selectedItems = [];
      }
    });
  }

  showAddModal() {
    const ref = this.dialogService.open(SeriesDetailComponent, {
      header: 'Thêm mới loạt bài',
      width: '70%',
    });
    ref.onClose.subscribe((data: SeriesDto) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.CREATED_OK_MSG);
        this.loadData();
        this.selectedItems = [];
      }
    });
  }

  showEditModal() {
    const ref = this.dialogService.open(SeriesDetailComponent, {
      header: 'Thêm mới loạt bài',
      width: '70%',
      data: {
        id: this.selectedItems[0].id,
      },
    });
    ref.onClose.subscribe((data: SeriesDto) => {
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
    this.toggleBlockUI(true);
    this.seriesService
      .deleteSeries(ids)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.alertService.showSuccess(MessageConstants.DELETED_OK_MSG);
          this.loadData();
          this.selectedItems = [];
          this.toggleBlockUI(false);
        },
        error: () => {
          this.alertService.showError(MessageConstants.DELETED_ERR_MSG);
          this.toggleBlockUI(false);
        },
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
