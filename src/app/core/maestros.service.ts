import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class MaestrosService {

  constructor(private supabase: SupabaseService) {}

  async obtenerMaestros() {
    return await this.supabase.client
      .from('maestros')
      .select('*')
      .order('id', { ascending: false });
  }

  async crearMaestro(maestro: any) {
    return await this.supabase.client
      .from('maestros')
      .insert([maestro])
      .select();
  }

  async actualizarMaestro(id: number, maestro: any) {
    return await this.supabase.client
      .from('maestros')
      .update(maestro)
      .eq('id', id)
      .select();
  }

  async eliminarMaestro(id: number) {
    return await this.supabase.client
      .from('maestros')
      .delete()
      .eq('id', id);
  }
}
