import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import {
  AdminApiPostCategoryApiClient,
  PostCategoryDto,
} from '../../../api/admin-api.service.generated';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UtilityService } from '../../../shared/services/utility.service';

@Component({
  templateUrl: './post-category-detail.component.html',
})
export class PostCategoryDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  // Default
  public blockedPanelDetail: boolean = false;
  public form: FormGroup;
  public title: string;
  public btnDisabled = false;
  public saveBtnName: string;
  public closeBtnName: string;
  selectedEntity = {} as PostCategoryDto;
  formSavedEventEmitter: EventEmitter<any> = new EventEmitter();

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private postCategoryService: AdminApiPostCategoryApiClient,
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
      { type: 'required', message: 'Bạn phải nhập tên' },
      { type: 'minlength', message: 'Bạn phải nhập ít nhất 3 kí tự' },
      { type: 'maxlength', message: 'Bạn không được nhập quá 255 kí tự' },
    ],
    slug: [{ type: 'required', message: 'Bạn phải nhập mã duy nhất' }],
    sortOrder: [{ type: 'required', message: 'Bạn phải nhập thứ tự' }],
  };

  public generateSlug() {
    var slug = this.utilService.makeSeoTitle(this.form.get('name')?.value);
    this.form.controls['slug'].setValue(slug);
  }

  loadDetail(id: string) {
    this.toggleBlockUI(true);
    this.postCategoryService
      .getPostCategoryById(this.config?.data?.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: PostCategoryDto) => {
          this.selectedEntity = res;
          this.buildForm();
          this.toggleBlockUI(false);
        },
        error: () => {
          this.toggleBlockUI(false);
        },
      });
  }

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
      sortOrder: new FormControl(
        this.selectedEntity.sortOrder || 0,
        Validators.required
      ),
      isActive: new FormControl(this.selectedEntity.isActive ?? false),
      seoDescription: new FormControl(
        this.selectedEntity.seoDescription || null
      ),
    });
  }

  saveChange() {
    this.toggleBlockUI(true);
    this.saveData();
  }

  saveData() {
    if (this.utilService.isEmpty(this.config?.data?.id)) {
      this.postCategoryService
        .createPostCategory(this.form.value)
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
      this.postCategoryService
        .updatePostCategory(this.config?.data?.id, this.form.value)
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
