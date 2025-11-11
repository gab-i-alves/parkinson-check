import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipDirective } from '../../directives/tooltip.directive';

@Component({
  selector: 'app-image-preview-modal',
  standalone: true,
  imports: [CommonModule, TooltipDirective],
  templateUrl: './image-preview-modal.component.html',
})
export class ImagePreviewModalComponent {
  // Modern signals API
  isVisible = input<boolean>(false);
  imageUrl = input<string | ArrayBuffer | null>(null);
  fileName = input<string>('');
  title = input<string>('Pré-visualização da Imagem');

  close = output<void>();

  // UI state
  zoom = signal<number>(100);
  imageLoaded = signal<boolean>(false);
  imageError = signal<boolean>(false);

  closeModal(): void {
    this.close.emit();
  }

  onImageLoad(): void {
    this.imageLoaded.set(true);
    this.imageError.set(false);
  }

  onImageError(): void {
    this.imageError.set(true);
    this.imageLoaded.set(false);
  }

  zoomIn(): void {
    const currentZoom = this.zoom();
    if (currentZoom < 200) {
      this.zoom.set(currentZoom + 25);
    }
  }

  zoomOut(): void {
    const currentZoom = this.zoom();
    if (currentZoom > 50) {
      this.zoom.set(currentZoom - 25);
    }
  }

  resetZoom(): void {
    this.zoom.set(100);
  }

  downloadImage(): void {
    const url = this.imageUrl();
    if (!url) return;

    const link = document.createElement('a');
    link.href = url as string;
    link.download = this.fileName() || 'imagem.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onBackdropClick(): void {
    this.closeModal();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }
}
