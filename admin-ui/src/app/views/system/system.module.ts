import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SystemRoutingModule } from './system-routing.module';
import { UserComponent } from './users/user.component';
import { RoleComponent } from './roles/role.component';
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
import { RoleDetailComponent } from './roles/role-detail.component';
import { PermissionGrantComponent } from './roles/permission-grant.component';
import { BadgeModule } from 'primeng/badge';
import { PickListModule } from 'primeng/picklist';
import { ImageModule } from 'primeng/image';
import { UserDetailComponent } from './users/user-detail.component';
import { ChangeEmailComponent } from './users/change-email.component';
import { SetPasswordComponent } from './users/set-password.component';
import { RoleAssignComponent } from './users/role-assign.component';
import { SharedPermissionDirective } from '../../shared/directives/shared-directives.module';

@NgModule({
  imports: [
    SystemRoutingModule,
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
    BadgeModule,
    PickListModule,
    ImageModule,
    SharedPermissionDirective,
  ],
  declarations: [
    UserComponent,
    RoleComponent,
    RoleDetailComponent,
    PermissionGrantComponent,
    UserDetailComponent,
    ChangeEmailComponent,
    SetPasswordComponent,
    RoleAssignComponent,
  ],
})
export class SystemModule {}
