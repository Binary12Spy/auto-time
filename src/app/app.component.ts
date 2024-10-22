import { Component, ViewChild, ViewContainerRef, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { LocalstorageService } from './services/localstorage/localstorage.service';
import { SessionStorageService } from './services/sessionstorage/sessionstorage.service';
import { ActitimeService } from './services/actitime/actitime.service';

import { LoginModalComponent } from './components/login-modal/login-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'auto-time';

  @ViewChild('modalContainer', { read: ViewContainerRef, static: true }) modalContainer!: ViewContainerRef;

  constructor(
    private localStorageService: LocalstorageService,
    private sessionStorageService: SessionStorageService,
    private actitimeService: ActitimeService
  ) {}

  ngOnInit() {
    this.showLoginModal();
  }

  showLoginModal() {
    const componentRef = this.modalContainer.createComponent(LoginModalComponent);
    componentRef.instance.show();
  }
}
