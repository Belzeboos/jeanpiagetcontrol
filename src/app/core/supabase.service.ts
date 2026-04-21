import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  public client: SupabaseClient;

  constructor() {
    this.client = createClient(
      'https://dulgjpgakoslrhctmivp.supabase.co',
      'sb_publishable_AfORqoyYEo2gWkQc4paC6g_gRvWnWws'
    );
  }

  async login(email: string, password: string) {
    return await this.client.auth.signInWithPassword({
      email,
      password
    });
  }

  async getUser() {
    return await this.client.auth.getUser();
  }

  async logout() {
    return await this.client.auth.signOut();
  }
}

    