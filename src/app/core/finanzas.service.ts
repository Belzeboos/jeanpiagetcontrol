import { Injectable } from '@angular/core';
import { SupabaseService } from '../core/supabase.service';


@Injectable({ providedIn: 'root' })
export class FinanzasService {

  constructor(private supabase: SupabaseService) {}

  // ── CONCEPTOS ──────────────────────────────────────
  async obtenerConceptos() {
    return await this.supabase.client
      .from('conceptos_cobro')
      .select('*')
      .eq('activo', true)
      .order('nombre');
  }

  async crearConcepto(concepto: any) {
    return await this.supabase.client
      .from('conceptos_cobro')
      .insert([concepto])
      .select();
  }

  async actualizarConcepto(id: number, concepto: any) {
    return await this.supabase.client
      .from('conceptos_cobro')
      .update(concepto)
      .eq('id', id)
      .select();
  }

  // ── CARGOS ─────────────────────────────────────────
  async obtenerCargosPorAlumno(alumnoId: number) {
    return await this.supabase.client
      .from('cargos_alumno')
      .select('*, pagos(*)')
      .eq('alumno_id', alumnoId)
      .order('fecha_cargo', { ascending: false });
  }

  async obtenerTodosLosCargos() {
    return await this.supabase.client
      .from('cargos_alumno')
      .select(`
        *,
        alumnos(id, nombre, grado, grupo, foto),
        pagos(*)
      `)
      .order('fecha_cargo', { ascending: false });
  }

  async crearCargo(cargo: any) {
    return await this.supabase.client
      .from('cargos_alumno')
      .insert([cargo])
      .select();
  }

  async crearCargosEnMasa(cargos: any[]) {
    return await this.supabase.client
      .from('cargos_alumno')
      .insert(cargos)
      .select();
  }

  async actualizarCargo(id: number, cargo: any) {
    return await this.supabase.client
      .from('cargos_alumno')
      .update(cargo)
      .eq('id', id)
      .select();
  }

  async eliminarCargo(id: number) {
    return await this.supabase.client
      .from('cargos_alumno')
      .delete()
      .eq('id', id);
  }

  // ── PAGOS ──────────────────────────────────────────
  async registrarPago(pago: any) {
    return await this.supabase.client
      .from('pagos')
      .insert([pago])
      .select();
  }

  async obtenerPagosPorCargo(cargoId: number) {
    return await this.supabase.client
      .from('pagos')
      .select('*')
      .eq('cargo_id', cargoId)
      .order('fecha_pago', { ascending: false });
  }

  // ── ALUMNOS (para el selector) ──────────────────────
  async obtenerAlumnosActivos() {
    return await this.supabase.client
      .from('alumnos')
      .select('id, nombre, grado, grupo, foto')
      .eq('estado', 'Activo')
      .order('nombre');
  }
}