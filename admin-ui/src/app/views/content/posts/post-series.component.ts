import {
  AddPostSeriesRequest,
  SeriesInListDto,
} from './../../../api/admin-api.service.generated';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AdminApiPostApiClient,
  AdminApiSeriesApiClient,
  PostDto,
} from '../../../api/admin-api.service.generated';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AlertService } from '../../../shared/services/alert.service';
import { UtilityService } from '../../../shared/services/utility.service';
import { MessageConstants } from '../../../shared/constants/message.constant';

@Component({
  templateUrl: './post-series.component.html',
})
export class PostSeriesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  // Default
  public blockedPanelDetail: boolean = false;
  public form: FormGroup;
  public title: string;
  public btnDisabled = false;
  public saveBtnName: string;
  public allSeries: any[] = [];
  public postSeries: any[];
  public selectedEntity: PostDto;

  constructor(
    private fb: FormBuilder,
    private postService: AdminApiPostApiClient,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private seriesService: AdminApiSeriesApiClient,
    private alertService: AlertService,
    private utilService: UtilityService
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
    var series = this.seriesService.getAllSeries();
    forkJoin({ series })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: any) => {
          var series = response.series as SeriesInListDto[];
          series.forEach((element) => {
            this.allSeries.push({
              value: element.id,
              label: element.name,
            });
          });

          if (this.utilService.isEmpty(this.config?.data?.id)) {
            this.toggleBlockUI(false);
          } else {
            this.loadSeries(this.config?.data?.id);
          }
        },
      });
  }

  loadSeries(postId: string) {
    this.postService
      .getSeriesBelong(postId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: SeriesInListDto[]) => {
          this.postSeries = res;
          this.toggleBlockUI(false);
        },
        error: () => {
          this.toggleBlockUI(false);
        },
      });
  }

  saveChange() {
    this.toggleBlockUI(true);
    this.saveData();
  }

  saveData() {
    var body: AddPostSeriesRequest = new AddPostSeriesRequest({
      postId: this.config?.data?.id,
      seriesId: this.form.controls['seriesId'].value,
      sortOrder: this.form.controls['sortOrder'].value,
    });
    this.seriesService
      .addPostSeries(body)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.alertService.showSuccess(MessageConstants.UPDATED_OK_MSG);
          this.loadSeries(this.config?.data?.id);
          this.toggleBlockUI(false);
        },
        error: () => {
          this.toggleBlockUI(false);
        },
      });
  }

  removeSeries(id: string) {
    this.toggleBlockUI(true);
    var body: AddPostSeriesRequest = new AddPostSeriesRequest({
      postId: this.config?.data?.id,
      seriesId: id,
    });
    this.seriesService
      .deletePostSeries(body)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.alertService.showSuccess(MessageConstants.DELETED_OK_MSG);
          this.loadSeries(this.config?.data?.id);
          this.toggleBlockUI(false);
        },
        error: () => {
          this.toggleBlockUI(false);
        },
      });
  }

  // Validate
  noSpecial: RegExp = /^[^<>*!_~]+$/;
  validationMessages = {
    seriesId: [{ type: 'required', message: 'Bạn phải chọn loạt bài' }],
    sortOrder: [{ type: 'required', message: 'Bạn phải nhập thứ tự' }],
  };

  buildForm() {
    this.form = this.fb.group({
      seriesId: new FormControl(null, Validators.required),
      sortOrder: new FormControl(0, Validators.required),
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
