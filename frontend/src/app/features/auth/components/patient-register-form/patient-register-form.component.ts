import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-patient-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgxMaskDirective],
  templateUrl: './patient-register-form.component.html',
})
export class PatientRegisterFormComponent {
  // DECISÃO DE ARQUITETURA: Uso de @Input para receber dados do pai.
  // O componente não cria o seu próprio FormGroup, tornando-o "burro" e reutilizável.
  // Ele apenas exibe o estado que lhe é fornecido.
  @Input() patientForm!: FormGroup;
  @Input() isLoading = false;
  @Input() apiError: string | null = null;

  // DECISÃO DE ARQUITETURA: Uso de @Output para comunicar com o pai.
  // Em vez de conter a lógica de submissão, ele emite um evento.
  // Isso desacopla o componente da lógica de negócio (ex: chamadas de API).
  @Output() formSubmit = new EventEmitter<void>();

  // Propaga o evento de submissão para o componente pai.
  onSubmit(): void {
    this.formSubmit.emit();
  }
}
