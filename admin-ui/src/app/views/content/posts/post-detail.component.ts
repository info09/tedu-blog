import { PostDto } from './../../../api/admin-api.service.generated';
import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import {
  AdminApiPostApiClient,
  AdminApiPostCategoryApiClient,
  PostCategoryDto,
} from '../../../api/admin-api.service.generated';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { UploadService } from '../../../shared/services/upload.service';
import { UtilityService } from '../../../shared/services/utility.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { environment } from '../../../../environments/environment';

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}
@Component({
  templateUrl: 'post-detail.component.html',
})
export class PostDetailComponent implements OnInit, OnDestroy {
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
  selectedEntity = {} as PostDto;
  public thumbnailImage;

  tags: string[] | undefined = [];
  filteredTags: string[] | undefined = [];
  postTags: string[] = [];

  formSavedEventEmitter: EventEmitter<any> = new EventEmitter();

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private utilService: UtilityService,
    private fb: FormBuilder,
    private postService: AdminApiPostApiClient,
    private postCategoryService: AdminApiPostCategoryApiClient,
    private uploadService: UploadService
  ) {}

  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.close();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  ngOnInit() {
    //Init form
    this.buildForm();
    //Load data to form
    var categories = this.postCategoryService.getAll();
    var tags = this.postService.getAllTags();
    this.toggleBlockUI(true);
    forkJoin({
      categories,
      tags,
    })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: any) => {
          //Push categories to dropdown list
          this.tags = response.tags as string[];
          var categories = response.categories as PostCategoryDto[];
          categories.forEach((element) => {
            this.postCategories.push({
              value: element.id,
              label: element.name,
            });
          });
          if (this.utilService.isEmpty(this.config.data?.id) == false) {
            this.postService
              .getPostTags(this.config?.data?.id)
              .pipe(takeUntil(this.ngUnsubscribe))
              .subscribe({
                next: (res: string[]) => {
                  this.postTags = res;
                  this.loadFormDetail(this.config.data?.id);
                },
              });
          } else {
            this.toggleBlockUI(false);
          }
        },
        error: () => {
          this.toggleBlockUI(false);
        },
      });
  }

  loadFormDetail(id: string) {
    this.postService
      .getPostById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: PostDto) => {
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
      this.postService
        .createPost(this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.ref.close(this.form.value);
            this.toggleBlockUI(false);
          },
        });
    } else {
      this.postService
        .updatePost(this.config?.data?.id, this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.ref.close(this.form.value);
            this.toggleBlockUI(false);
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
      categoryId: new FormControl(
        this.selectedEntity.categoryId || null,
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
      thumbnail: new FormControl(this.selectedEntity.thumbnail || null),
      tags: new FormControl(this.postTags),
    });
    if (this.selectedEntity.thumbnail) {
      this.thumbnailImage = environment.API_URL + this.selectedEntity.thumbnail;
    }
  }

  filterTag(event: AutoCompleteCompleteEvent) {
    let filtered: string[] = [];
    let query = event.query;

    for (let i = 0; i < (this.tags as string[]).length; i++) {
      let tag = (this.tags as string[])[i];
      if (tag.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(tag);
      }
    }
    if (filtered.length == 0) {
      filtered.push(query);
    }
    this.filteredTags = filtered;
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
