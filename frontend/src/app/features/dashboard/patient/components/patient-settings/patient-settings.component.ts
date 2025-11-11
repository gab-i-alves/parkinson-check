import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../../core/services/user.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { ToastService } from '../../../../../shared/services/toast.service';

interface PrivacySettings {
  share_data_for_statistics: boolean;
}

@Component({
  selector: 'app-patient-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-settings.component.html',
})
export class PatientSettingsComponent implements OnInit {
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  readonly isLoading = signal<boolean>(true);
  readonly isSaving = signal<boolean>(false);
  readonly shareDataForStatistics = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    this.http
      .get<PrivacySettings>(`${environment.apiUrl}/user/privacy-settings`)
      .subscribe({
        next: (settings) => {
          this.shareDataForStatistics.set(settings.share_data_for_statistics);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Erro ao carregar configurações:', err);
          this.errorMessage.set(
            'Erro ao carregar configurações. Tente novamente.'
          );
          this.isLoading.set(false);
        },
      });
  }

  savePrivacySettings(): void {
    this.isSaving.set(true);
    this.errorMessage.set(null);

    const settings: PrivacySettings = {
      share_data_for_statistics: this.shareDataForStatistics(),
    };

    this.http
      .put(`${environment.apiUrl}/user/privacy-settings`, settings)
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.toastService.success('Configurações salvas com sucesso!');
        },
        error: (err) => {
          console.error('Erro ao salvar configurações:', err);
          this.toastService.error(
            err.error?.detail || 'Erro ao salvar configurações. Tente novamente.'
          );
          this.isSaving.set(false);
        },
      });
  }

  onToggleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.shareDataForStatistics.set(target.checked);
  }
}
