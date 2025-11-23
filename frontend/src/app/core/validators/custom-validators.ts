import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador customizado para verificar se dois campos em um FormGroup coincidem.
 * @param controlName O nome do campo principal (ex: 'password').
 * @param matchingControlName O nome do campo de confirmação (ex: 'confirmPassword').
 * @returns Um ValidatorFn que pode ser aplicado a um FormGroup.
 */
export function matchPasswordValidator(
  controlName: string,
  matchingControlName: string
): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);

    if (!control || !matchingControl) {
      return null;
    }

    if (matchingControl.errors && !matchingControl.errors['mismatch']) {
      return null;
    }

    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      matchingControl.setErrors(null);
      return null;
    }
  };
}

/**
 * Validador customizado para verificar se o valor de um campo é um CPF válido.
 * @returns Um ValidatorFn que pode ser aplicado a um FormControl.
 */
export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const cpf = control.value;

    if (!cpf) {
      return null;
    }

    const cleanCpf = cpf.replace(/[^\d]/g, '');

    if (cleanCpf.length !== 11 || /^(\d)\1{10}$/.test(cleanCpf)) {
      return { cpfInvalid: true };
    }

    let sum = 0;
    let remainder: number;

    for (let i = 1; i <= 9; i++) {
      sum = sum + parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;

    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }
    if (remainder !== parseInt(cleanCpf.substring(9, 10))) {
      return { cpfInvalid: true };
    }

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum = sum + parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;

    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }
    if (remainder !== parseInt(cleanCpf.substring(10, 11))) {
      return { cpfInvalid: true };
    }

    return null;
  };
}

/**
 * Validador customizado para verificar se a senha cumpre os requisitos de segurança.
 * Requisitos: Pelo menos uma letra maiúscula, uma minúscula e um número.
 * @returns Um ValidatorFn que pode ser aplicado a um FormControl.
 */
export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric;

    // O nome 'strong' nos permite verificar este erro específico no template.
    return !passwordValid ? { strong: true } : null;
  };
}

/**
 * Validador customizado para verificar se o CRM está no formato válido brasileiro.
 * Formato: NNNNNN/UF (5-6 dígitos + barra + sigla do estado)
 * @returns Um ValidatorFn que pode ser aplicado a um FormControl.
 */
export function crmValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const crm = control.value;

    if (!crm) {
      return null; // Não valida se vazio (required cuida disso)
    }

    // Remove espaços e converte para maiúsculas
    const cleanCrm = crm.trim().toUpperCase();

    // Estados válidos brasileiros
    const validStates = [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
      'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
      'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];

    // Formato: NNNNNN/UF ou NNNNN/UF (5-6 dígitos + barra + 2 letras)
    const crmPattern = /^(\d{5,6})\/([A-Z]{2})$/;
    const match = cleanCrm.match(crmPattern);

    if (!match) {
      return {
        crmInvalidFormat: {
          value: crm,
          message: 'Use o formato: 123456/SP ou 12345/RJ'
        }
      };
    }

    const [, , state] = match;

    if (!validStates.includes(state)) {
      return {
        crmInvalidState: {
          value: state,
          message: `Estado ${state} não é válido`
        }
      };
    }

    return null;
  };
}
