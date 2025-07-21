import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserRole } from '../../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  activeTab: UserRole = 'paciente';

  selectTab(role: UserRole): void {
    this.activeTab = role;
  }
}
