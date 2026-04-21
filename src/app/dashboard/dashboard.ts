import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SupabaseService } from '../core/supabase.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

  constructor(
    private router: Router,
    private supabase: SupabaseService
  ) {}

  async cerrarSesion() {
    await this.supabase.logout();
    this.router.navigate(['/login']);
  }
}
