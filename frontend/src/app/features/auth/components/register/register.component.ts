import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserRole } from '../../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  activeTab: 'paciente' | 'medico' = 'paciente'; // Admin não tem opção de cadastro através de formulário

  selectTab(role: 'paciente' | 'medico'): void {
    this.activeTab = role;
  }
}
