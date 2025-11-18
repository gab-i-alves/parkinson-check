import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ChangeStatusData, UserManagementService } from '../../../services/user-management.service';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../../../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';
import { TooltipDirective } from '../../../../../shared/directives/tooltip.directive';
import { CpfPipe } from '../../../../../shared/pipes/cpf.pipe';
import { ToastService } from '../../../../../shared/services/toast.service';
import { formatDate } from '../../../shared/utils/display-helpers';

@Component({
  selector: 'app-edit-user',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BadgeComponent,
    TooltipDirective,
    CpfPipe
  ],
  templateUrl: './edit-user.component.html',
})
export class EditUserComponent implements OnInit {
  user = signal<User | undefined>(undefined);

  isStatusModalVisible = signal<boolean>(false);
  userToToggleStatus = signal<User | null>(null);
  deactivationReason = signal<string>('');

  editForm!: FormGroup;
  isLoading = false;
  apiError: string | null = null;
  public Number = Number;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private userManagementService: UserManagementService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.editForm = this.formBuilder.group({
      name: [''],
      email: [''],
      birthdate: [''],
      gender: [''],
      cep: [''],
      street: [''],
      number: [''],
      complement: [''],
      neighborhood: [''],
      city: [''],
      state: ['']
    });

    this.route.paramMap.subscribe((params) => {
      const idString = params.get('id');

      if (idString) {
        this.loadUser(Number(idString));
      } else {
        console.error('ID do usuário não fornecido na rota.');
      }
    });
  }

loadUser(userId: number) {
  this.userManagementService.getUserById(userId).subscribe({
    next: (user: any) => {
      if (user) {
        // Salvar dados do usuário
        this.user.set(this.userManagementService.mapBackendUserToFrontend(user));
        this.user()!.id = userId;

        // Preencher formulário com dados atuais
        this.editForm.patchValue({
          name: user.name || '',
          email: user.email || '',
          birthdate: user.birthdate || '',
          gender: user.gender || '',
          cep: user.address?.cep || '',
          street: user.address?.street || '',
          number: user.address?.number || '',
          complement: user.address?.complement || '',
          neighborhood: user.address?.neighborhood || '',
          city: user.address?.city || '',
          state: user.address?.state || ''
        });
      }
    },
    error: (err: HttpErrorResponse) => {
      console.error('Falha na api de busca:', err);
    }
  });
}
  onSubmit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.editForm.disable();
    this.apiError = null;

    console.log('Dados atualizados:', this.editForm.value);

    this.userManagementService
      .updateUser(this.user()!.id, this.editForm.value)
      .subscribe({
        next: (response: any) => {
          console.log('Edição de perfil realizada', response);
          this.toastService.success('Dados do usuário atualizados com sucesso');
          this.router.navigate(['/dashboard/users']);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erro ao atualizar usuário:', err);
          const errorMessage = err.error?.detail || 'Ocorreu um erro ao atualizar o usuário.';
          this.apiError = errorMessage;
          this.toastService.error(errorMessage);
          this.isLoading = false;
          this.editForm.enable();
        },
      });
  }

  
  getStatusLabel(status: boolean): string {
    return status ? 'Ativo' : 'Inativo';
  }

  getStatusBadgeVariant(status: boolean): any {
    return status ? 'success' : 'error';
  }

  getUserTypeLabel(userRole?: number): string {
    if (!userRole) return 'N/A';
    const labels: Record<number, string> = {
      1: 'Paciente',
      2: 'Médico',
      3: 'Administrador',
    };
    return labels[userRole];
  }

  getUserTypeBadgeVariant(userRole?: number): any {
    if (!userRole) return 'neutral';
    const variants: Record<number, any> = {
      1: 'info',      // Paciente - blue
      2: 'success',   // Médico - green
      3: 'warning',   // Administrador - yellow
    };
    return variants[userRole] || 'neutral';
  }

  formatDateDisplay(dateString: string | null | undefined): string {
    return formatDate(dateString || null);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/users']);
  }


    initiateStatusChange(user: User): void {
      this.userToToggleStatus.set(user);
      this.deactivationReason.set('');
      this.isStatusModalVisible.set(true);
    }

    cancelStatusChange(): void {
      this.userToToggleStatus.set(null);
      this.deactivationReason.set('');
      this.isStatusModalVisible.set(false);
    }

    confirmStatusChange(): void {
      const userToToggleStatus = this.userToToggleStatus();
      if (!userToToggleStatus) {
        return;
      }

      const is_active = !userToToggleStatus.status;
      const reason = this.deactivationReason();

      const statusData: ChangeStatusData = {
        is_active,
        reason: reason || undefined,
      };

      this.userManagementService
        .changeUserStatus(userToToggleStatus.id, statusData)
        .subscribe({
          next: () => {
            this.loadUser(this.user()!.id);

            this.toastService.success('Status do usuário alterado com sucesso');

            this.isStatusModalVisible.set(false);
            this.userToToggleStatus.set(null);
            this.deactivationReason.set('');
          },
          error: (err: HttpErrorResponse) => {
            this.toastService.error('Erro ao alterar o status do usuário');
            console.error(err);
            this.isStatusModalVisible.set(false);
            this.deactivationReason.set('');
          },
        });
    }
}
