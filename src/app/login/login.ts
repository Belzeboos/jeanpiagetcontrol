import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../core/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ingresar() {
    this.loading = true;
    this.error = '';

    const { error } = await this.supabase.login(this.email, this.password);

    if (error) {
      this.error = 'Usuario o contraseña incorrectos';
      this.loading = false;
      return;
    }

    this.router.navigate(['/dashboard']);
  }
}
