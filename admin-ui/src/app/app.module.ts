import { NgModule } from '@angular/core';
import {
  HashLocationStrategy,
  LocationStrategy,
  PathLocationStrategy,
} from '@angular/common';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { NgScrollbarModule } from 'ngx-scrollbar';

// Import routing module
import { AppRoutingModule } from './app-routing.module';

// Import app component
import { AppComponent } from './app.component';

// Import containers
import {
  DefaultFooterComponent,
  DefaultHeaderComponent,
  DefaultLayoutComponent,
} from './containers';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import {
  ADMIN_API_BASE_URL,
  AdminApiAuthApiClient,
  AdminApiPostApiClient,
  AdminApiPostCategoryApiClient,
  AdminApiRoleApiClient,
  AdminApiRoyaltyApiClient,
  AdminApiSeriesApiClient,
  AdminApiTestApiClient,
  AdminApiTokenApiClient,
  AdminApiUserApiClient,
} from './api/admin-api.service.generated';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService, SharedModule } from 'primeng/api';
import { AlertService } from './shared/services/alert.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenStorageService } from './shared/services/token-storage.service';
import { AuthGuard } from './shared/auth.guard';
import { TokenInterceptor } from './shared/interceprors/token.interceptor';
const APP_CONTAINERS = [
  DefaultFooterComponent,
  DefaultHeaderComponent,
  DefaultLayoutComponent,
];
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UtilityService } from './shared/services/utility.service';
import { UploadService } from './shared/services/upload.service';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import {
  BreadcrumbModule,
  ButtonGroupModule,
  FooterModule,
  FormModule,
  GridModule,
  HeaderModule,
  ListGroupModule,
  NavModule,
  ProgressModule,
  SidebarModule,
  TabsModule,
  UtilitiesModule,
  DropdownModule,
  BadgeModule,
} from '@coreui/angular';
import { CardModule } from 'primeng/card';
import { BroadcastService } from './shared/services/broadcast.service';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [AppComponent, ...APP_CONTAINERS],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AvatarModule,
    BreadcrumbModule,
    FooterModule,
    DropdownModule,
    GridModule,
    HeaderModule,
    SidebarModule,
    IconModule,
    NavModule,
    ButtonModule,
    FormModule,
    UtilitiesModule,
    ButtonGroupModule,
    ReactiveFormsModule,
    SidebarModule,
    SharedModule,
    TabsModule,
    ListGroupModule,
    ProgressModule,
    BadgeModule,
    ListGroupModule,
    CardModule,
    NgScrollbarModule,
    ToastModule,
    HttpClientModule,
    ConfirmDialogModule,
    DynamicDialogModule,
  ],
  providers: [
    { provide: ADMIN_API_BASE_URL, useValue: environment.API_URL },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
    IconSetService,
    Title,
    MessageService,
    AlertService,
    AdminApiAuthApiClient,
    TokenStorageService,
    AuthGuard,
    AdminApiTestApiClient,
    AdminApiTokenApiClient,
    AdminApiRoleApiClient,
    AdminApiUserApiClient,
    AdminApiPostCategoryApiClient,
    AdminApiPostApiClient,
    AdminApiSeriesApiClient,
    AdminApiRoyaltyApiClient,
    DialogService,
    ConfirmationService,
    UtilityService,
    UploadService,
    BroadcastService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
