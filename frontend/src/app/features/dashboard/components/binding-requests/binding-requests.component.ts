import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BindingRequest, DoctorService } from '../../services/doctor.service';

@Component({
  selector: 'app-binding-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './binding-requests.component.html',
})
export class BindingRequestsComponent implements OnInit {
  private medicService = inject(DoctorService);

  requests = signal<BindingRequest[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading.set(true);
    this.medicService.getBindingRequests().subscribe({
      next: (data) => {
        this.requests.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  acceptRequest(id: number): void {
    this.medicService.acceptBindingRequest(id).subscribe({
      next: () => {
        alert('Solicitação aceita!');
        this.requests.update((reqs) => reqs.filter((r) => r.id !== id));
      },
      error: (err) => alert(`Erro ao aceitar: ${err.error.detail}`),
    });
  }

  rejectRequest(id: number): void {
    this.medicService.rejectBindingRequest(id).subscribe({
      next: () => {
        alert('Solicitação recusada.');
        this.requests.update((reqs) => reqs.filter((r) => r.id !== id));
      },
      error: (err) => alert(`Erro ao recusar: ${err.error.detail}`),
    });
  }
}
