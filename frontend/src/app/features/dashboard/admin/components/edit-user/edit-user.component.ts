import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ChangeStatusData, UserManagementService } from '../../services/user-management.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { User } from '../../../../core/models/user.model';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-user',
  imports: [ReactiveFormsModule, ConfirmationModalComponent, CommonModule],
  templateUrl: './edit-user.component.html',
})
export class EditUserComponent implements OnInit {
  user = signal<User | undefined>(undefined);
  
  isStatusModalVisible = signal<boolean>(false);
  userToToggleStatus = signal<User | null>(null);

  editForm!: FormGroup;
  isLoading = false;
  apiError: string | null = null;
  public Number = Number;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private userManagementService: UserManagementService,
    private router: Router
  ) {}

  ngOnInit(): void {
this.editForm = this.formBuilder.group({
      name: [''], 
      email: [''], 
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
    
    next: (user) => {
        
        if (user) {
            this.user.set(this.userManagementService.mapBackendUserToFrontend(user));
            this.user()!.id = userId
            console.log(this.user());
      }
    },
    
    error: (err) => {
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
          this.router.navigate(['/dashboard/users'], {
            state: {
              message:
                'Cadastro realizado! Você será notificado por e-mail após a aprovação.',
            },
          });
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erro no cadastro do médico:', err);
          this.apiError = err.error?.detail || 'Ocorreu um erro no cadastro.';
          this.isLoading = false;
          this.editForm.enable();
        },
      });
  }

  
  getStatusLabel(status: boolean): string {
    return status ? 'ativo' : 'inativo';
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

  
    initiateStatusChange(user: User): void {
      this.userToToggleStatus.set(user);
      this.isStatusModalVisible.set(true);
    }
  
    cancelStatusChange(): void {
      this.userToToggleStatus.set(null);
      this.isStatusModalVisible.set(false);
    }
  
    confirmStatusChange(): void {
      const userToToggleStatus = this.userToToggleStatus();
      if (!userToToggleStatus) {
        return;
      }
  
      const is_active = !userToToggleStatus.status;
      const reason = ''; // implementar motivo de desativação
  
      const statusData: ChangeStatusData = {
        is_active,
        reason,
      };
  
      this.userManagementService
        .changeUserStatus(userToToggleStatus.id, statusData)
        .subscribe({
          next: () => {
            this.loadUser(this.user()!.id);
  
            alert('Status do Usuário alterado');
  
            this.isStatusModalVisible.set(false);
            this.userToToggleStatus.set(null);
          },
          error: (err) => {
            alert('Ocorreu um erro ao alterar o status do usuário.');
            console.error(err);
            this.isStatusModalVisible.set(false);
          },
        });
    }
}
