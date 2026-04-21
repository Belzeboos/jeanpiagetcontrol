import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AlumnosService {

  constructor(private supabase: SupabaseService) {}

  async obtenerAlumnos() {
    return await this.supabase.client
      .from('alumnos')
      .select('*')
      .order('id', { ascending: false });
  }

  async crearAlumno(alumno: any) {
    return await this.supabase.client
      .from('alumnos')
      .insert([alumno])
      .select();
  }

  async actualizarAlumno(id: number, alumno: any) {
    return await this.supabase.client
      .from('alumnos')
      .update(alumno)
      .eq('id', id)
      .select();
  }

  // ✅ NUEVO: ELIMINAR ALUMNO
  async eliminarAlumno(id: number) {
    return await this.supabase.client
      .from('alumnos')
      .delete()
      .eq('id', id);
  }
}
