import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';

import { ActitimeService } from '../../services/actitime/actitime.service';

@Component({
  selector: 'app-test-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-component.component.html',
  styleUrl: './test-component.component.scss'
})
export class TestComponentComponent {
  public companyName: string = "";

  constructor(private actitimeService: ActitimeService) {}

  setCompany(): void {
    this.actitimeService.companyId = this.companyName;
    this.actitimeService.verifyCredentialsAsync("username", "password").then(result => {
      console.log(result);
    });
    this.actitimeService.getMyUserInfoAsync().then(userInfo => {
      console.log(userInfo);
    });
  }

  getTasks(): void {
    this.actitimeService.getTasksAsync().then(tasks => {
      console.log(tasks);
    });
    this.actitimeService.getLeaveTypesAsync().then(leaveTypes => {
      console.log(leaveTypes);
    });
    const now = new Date();
    const later = new Date();
    later.setDate(now.getDate() + 29);
    this.actitimeService.getSchedulesAsync(now, later).then(schedules => {
      console.log(schedules);
    });

  }
}
