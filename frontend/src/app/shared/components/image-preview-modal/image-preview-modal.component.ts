import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-preview-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-preview-modal.component.html',
})
export class ImagePreviewModalComponent {
  @Input() isVisible = false;
  @Input() imageUrl: string | ArrayBuffer | null = null;
  @Input() fileName = '';

  @Output() close = new EventEmitter<void>();

  closeModal(): void {
    this.close.emit();
  }
}
