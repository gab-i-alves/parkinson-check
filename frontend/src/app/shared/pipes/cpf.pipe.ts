import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cpf',
  standalone: true,
})
export class CpfPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    // Remove todos os caracteres não numéricos
    const cleanedValue = value.replace(/\D/g, '');

    // Verifica se tem 11 dígitos
    if (cleanedValue.length !== 11) {
      return value; // Retorna o valor original se não tiver 11 dígitos
    }

    // Formata: 123.456.789-00
    return cleanedValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}
