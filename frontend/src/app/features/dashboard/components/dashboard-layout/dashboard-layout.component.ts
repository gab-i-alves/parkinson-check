import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../../../shared/components/layout/sidebar/sidebar.component';
import { AuthService } from '../../../auth/services/auth.services';
import { UserService } from '../../../../core/services/user.service';
import { Subscription } from 'rxjs';
import { UserProfile } from '../../../../core/models/user.model';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private userSubscription?: Subscription;

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.userService.setCurrentUser(user as UserProfile);
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }
}
