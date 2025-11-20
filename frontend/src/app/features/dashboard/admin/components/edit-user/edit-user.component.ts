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
import { BreadcrumbService } from '../../../../../shared/services/breadcrumb.service';
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

  isSaveConfirmModalVisible = signal<boolean>(false);

  editForm!: FormGroup;
  isLoading = false;
  apiError: string | null = null;
  public Number = Number;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private userManagementService: UserManagementService,
    private router: Router,
    private toastService: ToastService,
    private breadcrumbService: BreadcrumbService
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
        // Salvar dados do usuário diretamente do backend (preserva address)
        this.user.set({
          id: userId,
          name: user.name,
          email: user.email,
          cpf: user.cpf,
          role: user.user_type,
          gender: user.gender,
          status: user.is_active,
          createdAt: user.created_at,
          location: user.location,
          address: user.address  // Preservar objeto address do backend
        } as any);

        // Atualizar breadcrumb com nome do usuário
        this.breadcrumbService.updateBreadcrumb(this.router.url, user.name);

        // Preencher formulário com dados atuais
        this.editForm.patchValue({
          name: user.name || '',
          email: user.email || '',
          birthdate: user.birthdate || '',
          gender: user.gender ? user.gender.toString() : '',  // Converter para string
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
      this.toastService.error('Por favor, preencha todos os campos obrigatórios corretamente');
      return;
    }

    // Mostrar modal de confirmação ao invés de salvar diretamente
    this.isSaveConfirmModalVisible.set(true);
  }

  cancelSave(): void {
    this.isSaveConfirmModalVisible.set(false);
  }

  confirmSave(): void {
    this.isSaveConfirmModalVisible.set(false);

    this.isLoading = true;
    this.editForm.disable();
    this.apiError = null;

    // Preparar payload com conversão de tipos
    const formValue = this.editForm.value;
    const payload = {
      ...formValue,
      gender: formValue.gender ? parseInt(formValue.gender, 10) : undefined  // Converter para inteiro
    };

    console.log('Dados atualizados:', payload);

    this.userManagementService
      .updateUser(this.user()!.id, payload)
      .subscribe({
        next: (response: any) => {
          console.log('Edição de perfil realizada', response);
          this.toastService.success('Dados do usuário atualizados com sucesso');
          this.router.navigate(['/dashboard/admin/users']);
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
