import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ContentRoutingModule } from './content-routing.module';
import { PostComponent } from './posts/post.component';
import { PostCategoryComponent } from './post-categories/post-category.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BlockUIModule } from 'primeng/blockui';
import { PaginatorModule } from 'primeng/paginator';
import { PanelModule } from 'primeng/panel';
import { CheckboxModule } from 'primeng/checkbox';
import { SharedModule } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TeduSharedModule } from '../../shared/modules/tedu-shared.module';
import { KeyFilterModule } from 'primeng/keyfilter';
import { PostDetailComponent } from './posts/post-detail.component';
import { PostCategoryDetailComponent } from './post-categories/post-category-detail.component';
import { EditorModule } from 'primeng/editor';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { BadgeModule } from 'primeng/badge';
import { PostSeriesComponent } from './posts/post-series.component';
import { PostActivityLogComponent } from './posts/post-activity-log.component';
import { PostReturnReasonComponent } from './posts/post-return-reason.component';
import { SeriesComponent } from './series/series.component';
import { SeriesDetailComponent } from './series/series-detail.component';
import { SeriesPostComponent } from './series/series-post.component';
import { ImageModule } from 'primeng/image';
import { AutoCompleteModule } from 'primeng/autocomplete';
@NgModule({
  imports: [
    ContentRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ProgressSpinnerModule,
    BlockUIModule,
    PaginatorModule,
    PanelModule,
    CheckboxModule,
    ButtonModule,
    InputTextModule,
    SharedModule,
    KeyFilterModule,
    TeduSharedModule,
    EditorModule,
    InputNumberModule,
    InputTextareaModule,
    BadgeModule,
    ImageModule,
    AutoCompleteModule,
  ],
  declarations: [
    PostComponent,
    PostCategoryComponent,
    PostDetailComponent,
    PostCategoryDetailComponent,
    PostSeriesComponent,
    PostActivityLogComponent,
    PostReturnReasonComponent,
    SeriesComponent,
    SeriesDetailComponent,
    SeriesPostComponent,
  ],
})
export class ContentModule {}
