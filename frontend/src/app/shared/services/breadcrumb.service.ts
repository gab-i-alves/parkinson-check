import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface BreadcrumbOverride {
  path: string;
  label: string;
}

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private breadcrumbOverrides = new BehaviorSubject<Map<string, string>>(
    new Map()
  );

  breadcrumbOverrides$: Observable<Map<string, string>> =
    this.breadcrumbOverrides.asObservable();

  /**
   * Update the label for a specific breadcrumb path
   * @param path The path to update (e.g., '/dashboard/doctor/patient/1')
   * @param label The new label to display (e.g., 'João Silva')
   */
  updateBreadcrumb(path: string, label: string): void {
    const currentOverrides = this.breadcrumbOverrides.value;
    currentOverrides.set(path, label);
    this.breadcrumbOverrides.next(currentOverrides);
  }

  /**
   * Clear breadcrumb override for a specific path
   * @param path The path to clear
   */
  clearBreadcrumb(path: string): void {
    const currentOverrides = this.breadcrumbOverrides.value;
    currentOverrides.delete(path);
    this.breadcrumbOverrides.next(currentOverrides);
  }

  /**
   * Clear all breadcrumb overrides
   */
  clearAllBreadcrumbs(): void {
    this.breadcrumbOverrides.next(new Map());
  }

  /**
   * Get the current label for a path, if any override exists
   * @param path The path to check
   * @returns The overridden label or undefined
   */
  getBreadcrumbLabel(path: string): string | undefined {
    return this.breadcrumbOverrides.value.get(path);
  }
}
