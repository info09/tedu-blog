import { UploadService } from './../../../shared/services/upload.service';
import { environment } from '../../../../environments/environment';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import {
  AdminApiSeriesApiClient,
  SeriesDto,
} from '../../../api/admin-api.service.generated';
import { Subject, takeUntil } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UtilityService } from '../../../shared/services/utility.service';

@Component({
  templateUrl: './series-detail.component.html',
})
export class SeriesDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  // Default
  public blockedPanelDetail: boolean = false;
  public form: FormGroup;
  public title: string;
  public btnDisabled = false;
  public saveBtnName: string;
  public postCategories: any[] = [];
  public contentTypes: any[] = [];
  public series: any[] = [];
  selectedEntity = {} as SeriesDto;
  public thumbnailImage;
  formSavedEventEmitter: EventEmitter<any> = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private seriesService: AdminApiSeriesApiClient,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private uploadService: UploadService,
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
    this.toggleBlockUI(true);
    if (this.utilService.isEmpty(this.config?.data?.id)) {
      this.toggleBlockUI(false);
    } else {
      this.loadFormDetail(this.config?.data?.id);
      this.toggleBlockUI(false);
    }
  }

  loadFormDetail(id: string) {
    this.toggleBlockUI(true);
    this.seriesService
      .getSeriesById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: SeriesDto) => {
          this.selectedEntity = res;
          this.buildForm();
          this.toggleBlockUI(false);
        },
        error: () => {
          this.toggleBlockUI(false);
        },
      });
  }

  generateSlug() {
    var slug = this.utilService.makeSeoTitle(this.form.get('name')?.value);
    this.form.controls['slug'].setValue(slug);
  }

  saveChange() {
    this.toggleBlockUI(true);
    this.saveData();
  }

  saveData() {
    if (this.utilService.isEmpty(this.config?.data?.id)) {
      this.seriesService
        .createSeries(this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.ref.close(this.form.value);
            this.toggleBlockUI(false);
          },
          error: () => {
            this.toggleBlockUI(false);
          },
        });
    } else {
      this.seriesService
        .updateSeries(this.config?.data?.id, this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.ref.close(this.form.value);
            this.toggleBlockUI(false);
          },
          error: () => {
            this.toggleBlockUI(false);
          },
        });
    }
  }

  onFileChange(event) {
    if (event.target.files && event.target.files.length) {
      this.uploadService.uploadImage('posts', event.target.files).subscribe({
        next: (response: any) => {
          this.form.controls['thumbnail'].setValue(response.path);
          this.thumbnailImage = environment.API_URL + response.path;
        },
        error: (err: any) => {
          console.log(err);
        },
      });
    }
  }

  // Validate
  noSpecial: RegExp = /^[^<>*!_~]+$/;
  validationMessages = {
    name: [
      { type: 'required', message: 'Bạn phải nhập tên' },
      { type: 'minlength', message: 'Bạn phải nhập ít nhất 3 kí tự' },
      { type: 'maxlength', message: 'Bạn không được nhập quá 255 kí tự' },
    ],
    slug: [{ type: 'required', message: 'Bạn phải URL duy nhất' }],
    description: [{ type: 'required', message: 'Bạn phải nhập mô tả ngắn' }],
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
      slug: new FormControl(
        this.selectedEntity.slug || null,
        Validators.required
      ),
      description: new FormControl(
        this.selectedEntity.description || null,
        Validators.required
      ),
      seoDescription: new FormControl(
        this.selectedEntity.seoDescription || null
      ),
      content: new FormControl(this.selectedEntity.content || null),
      isActive: new FormControl(this.selectedEntity.isActive ?? false),
      thumbnail: new FormControl(this.selectedEntity.thumbnail || null),
    });
    if (this.selectedEntity.thumbnail) {
      this.thumbnailImage = environment.API_URL + this.selectedEntity.thumbnail;
    }
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
