import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  public client: SupabaseClient;

  constructor() {
    this.client = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  async login(email: string, password: string) {
    return await this.client.auth.signInWithPassword({ email, password });
  }

  async getUser() {
    return await this.client.auth.getUser();
  }

  async logout() {
    return await this.client.auth.signOut();
  }
}