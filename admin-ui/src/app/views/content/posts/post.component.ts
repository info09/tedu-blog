import { Component } from '@angular/core';
import { AdminApiTestApiClient } from '../../../api/admin-api.service.generated';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
})
export class PostComponent {
  constructor(private testApiClient: AdminApiTestApiClient) {}
  test() {
    this.testApiClient.get().subscribe({
      next: () => {
        console.log('Ok');
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
}
