import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { LocalstorageService } from '../../services/localstorage/localstorage.service';
import { SessionStorageService } from '../../services/sessionstorage/sessionstorage.service';
import { ActitimeService } from '../../services/actitime/actitime.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  templateUrl: './login-modal.component.html',
  styleUrl: './login-modal.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
})
export class LoginModalComponent {
  public shown: boolean = false;

  public companyId: string = "";
  public username: string = "";
  public password: string = "";

  public hidePassword: boolean = true;

  constructor(private localStorageService: LocalstorageService, private sessionStorageService: SessionStorageService, private actitimeService: ActitimeService) {
    this.companyId = this.localStorageService.getItem("CompanyId");
  }

  show() {
    console.log("Showing login modal");
    this.shown = true;
  }

  openModal() {
    // Logic to open the modal
    const modalElement = document.getElementById('modal-container');
    if (modalElement) {
      modalElement.style.display = 'block';
    }
  }

  closeModal() {
    this.shown = false;
  }

  login() {
    this.actitimeService.companyId = this.companyId;
    this.actitimeService.verifyCredentialsAsync(this.username, this.password).then(result => {
      if (result) {
        console.log("Login successful");
        this.localStorageService.setItem("CompanyId", this.companyId);
        this.sessionStorageService.setItem("ActitimeUsername", this.username);
        this.sessionStorageService.setItem("ActitimePassword", this.password);
        this.closeModal();
      } else {
        alert("Invalid credentials");
      }
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
}
