import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// DECISÃO: Interface para tipar a resposta da API (melhor segurança)
export interface CepAddress {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CepService {
  constructor(private http: HttpClient) {}

  /**
   * Busca um endereço a partir de um CEP na API do ViaCEP.
   * @param cep O CEP a ser pesquisado (apenas números).
   * @returns Um Observable com os dados do endereço ou null se não for encontrado.
   */
  search(cep: string): Observable<CepAddress | null> {
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      return of(null); // Retorna um observable de null se o CEP for inválido.
    }

    return this.http
      .get<CepAddress>(`https://viacep.com.br/ws/${cleanCep}/json/`)
      .pipe(
        map((address) => (address.erro ? null : address)),
        catchError(() => of(null))
      );
  }
}
