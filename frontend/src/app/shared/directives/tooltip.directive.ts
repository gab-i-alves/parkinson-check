import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
  OnDestroy
} from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') tooltipText = '';
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

  private tooltipElement?: HTMLElement;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.tooltipText) return;
    this.show();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hide();
  }

  @HostListener('click')
  onClick(): void {
    this.hide();
  }

  private show(): void {
    this.create();
    this.setPosition();
    this.renderer.addClass(this.tooltipElement, 'tooltip-show');
  }

  private hide(): void {
    if (this.tooltipElement) {
      this.renderer.removeClass(this.tooltipElement, 'tooltip-show');
      setTimeout(() => {
        if (this.tooltipElement) {
          this.renderer.removeChild(document.body, this.tooltipElement);
          this.tooltipElement = undefined;
        }
      }, 200);
    }
  }

  private create(): void {
    this.tooltipElement = this.renderer.createElement('div');

    const text = this.renderer.createText(this.tooltipText);
    this.renderer.appendChild(this.tooltipElement, text);

    // Base styles
    this.renderer.addClass(this.tooltipElement, 'tooltip');
    this.renderer.setStyle(this.tooltipElement, 'position', 'absolute');
    this.renderer.setStyle(this.tooltipElement, 'padding', '0.5rem 0.75rem');
    this.renderer.setStyle(this.tooltipElement, 'background-color', 'rgb(23, 23, 23)');
    this.renderer.setStyle(this.tooltipElement, 'color', 'white');
    this.renderer.setStyle(this.tooltipElement, 'font-size', '0.75rem');
    this.renderer.setStyle(this.tooltipElement, 'border-radius', '0.5rem');
    this.renderer.setStyle(this.tooltipElement, 'z-index', '9999');
    this.renderer.setStyle(this.tooltipElement, 'white-space', 'nowrap');
    this.renderer.setStyle(this.tooltipElement, 'pointer-events', 'none');
    this.renderer.setStyle(this.tooltipElement, 'opacity', '0');
    this.renderer.setStyle(this.tooltipElement, 'transition', 'opacity 200ms ease-in-out');
    this.renderer.setStyle(this.tooltipElement, 'box-shadow', '0 4px 6px -1px rgb(0 0 0 / 0.1)');

    // Arrow
    const arrow = this.renderer.createElement('div');
    this.renderer.setStyle(arrow, 'position', 'absolute');
    this.renderer.setStyle(arrow, 'width', '0');
    this.renderer.setStyle(arrow, 'height', '0');
    this.renderer.setStyle(arrow, 'border-style', 'solid');

    if (this.tooltipPosition === 'top') {
      this.renderer.setStyle(arrow, 'bottom', '-4px');
      this.renderer.setStyle(arrow, 'left', '50%');
      this.renderer.setStyle(arrow, 'transform', 'translateX(-50%)');
      this.renderer.setStyle(arrow, 'border-width', '4px 4px 0 4px');
      this.renderer.setStyle(arrow, 'border-color', 'rgb(23, 23, 23) transparent transparent transparent');
    } else if (this.tooltipPosition === 'bottom') {
      this.renderer.setStyle(arrow, 'top', '-4px');
      this.renderer.setStyle(arrow, 'left', '50%');
      this.renderer.setStyle(arrow, 'transform', 'translateX(-50%)');
      this.renderer.setStyle(arrow, 'border-width', '0 4px 4px 4px');
      this.renderer.setStyle(arrow, 'border-color', 'transparent transparent rgb(23, 23, 23) transparent');
    }

    this.renderer.appendChild(this.tooltipElement, arrow);
    this.renderer.appendChild(document.body, this.tooltipElement);
  }

  private setPosition(): void {
    if (!this.tooltipElement) return;

    const hostPos = this.el.nativeElement.getBoundingClientRect();
    const tooltipPos = this.tooltipElement.getBoundingClientRect();
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    let top = 0;
    let left = 0;

    if (this.tooltipPosition === 'top') {
      top = hostPos.top - tooltipPos.height - 8;
      left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
    } else if (this.tooltipPosition === 'bottom') {
      top = hostPos.bottom + 8;
      left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
    } else if (this.tooltipPosition === 'left') {
      top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
      left = hostPos.left - tooltipPos.width - 8;
    } else if (this.tooltipPosition === 'right') {
      top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
      left = hostPos.right + 8;
    }

    this.renderer.setStyle(this.tooltipElement, 'top', `${top + scrollPos}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
  }

  ngOnDestroy(): void {
    this.hide();
  }
}
