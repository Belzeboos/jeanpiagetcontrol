import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FinanzasService } from '../core/finanzas.service';

@Component({
  selector: 'app-finanzas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finanzas.html',
  styleUrl: './finanzas.scss'
})
export class Finanzas implements OnInit {

  // ── VISTAS ────────────────────────────────────────
  vista: 'alumnos' | 'conceptos' = 'alumnos';

  // ── DATOS BASE ────────────────────────────────────
  alumnos: any[] = [];
  alumnosFiltrados: any[] = [];
  conceptos: any[] = [];
  cargos: any[] = [];

  // ── BÚSQUEDA ──────────────────────────────────────
  searchText = '';

  // ── ALUMNO SELECCIONADO ───────────────────────────
  alumnoSeleccionado: any = null;
  cargosAlumno: any[] = [];

  // ── ESTADÍSTICAS ──────────────────────────────────
  totalPendiente = 0;
  totalCobrado = 0;
  totalAlumnosConDeuda = 0;

  // ── MODALES ───────────────────────────────────────
  modalCargo = false;
  modalPago = false;
  modalConcepto = false;
  modalAsignar = false;

  // ── FORMULARIOS ───────────────────────────────────
  cargoForm: any = {};
  pagoForm: any = {};
  conceptoForm: any = {};
  asignarForm: any = {};

  cargoSeleccionado: any = null;
  editandoConcepto = false;
  conceptoId = 0;
  guardando = false;

  constructor(
    private finanzasService: FinanzasService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  async ngOnInit() {
    await Promise.all([
      this.cargarAlumnos(),
      this.cargarConceptos(),
      this.cargarTodosLosCargos()
    ]);
  }

  // ── CARGA DE DATOS ────────────────────────────────

  async cargarAlumnos() {
    try {
      const { data, error } = await this.finanzasService.obtenerAlumnosActivos();
      if (error) { console.error('Error alumnos:', error); return; }
      this.alumnos = data || [];
      this.alumnosFiltrados = [...this.alumnos];
      this.cdr.detectChanges();
    } catch (e) { console.error(e); }
  }

  async cargarConceptos() {
    try {
      const { data, error } = await this.finanzasService.obtenerConceptos();
      if (error) { console.error('Error conceptos:', error); return; }
      this.conceptos = data || [];
      this.cdr.detectChanges();
    } catch (e) { console.error(e); }
  }

  async cargarTodosLosCargos() {
    try {
      const { data, error } = await this.finanzasService.obtenerTodosLosCargos();
      if (error) { console.error('Error cargos:', error); return; }
      this.cargos = data || [];
      this.recalcularEstadisticas();
      this.cdr.detectChanges();
    } catch (e) { console.error(e); }
  }

  async cargarCargosAlumno(alumnoId: number) {
    try {
      const { data, error } = await this.finanzasService.obtenerCargosPorAlumno(alumnoId);
      if (error) { console.error('Error cargos alumno:', error); return; }
      this.cargosAlumno = data || [];
      this.cdr.detectChanges();
    } catch (e) { console.error(e); }
  }

  // ── ESTADÍSTICAS ──────────────────────────────────

  recalcularEstadisticas() {
    this.totalPendiente = 0;
    this.totalCobrado = 0;
    const alumnosConDeuda = new Set<number>();

    for (const cargo of this.cargos) {
      const pendiente = Number(cargo.monto_total) - Number(cargo.monto_pagado);
      this.totalCobrado += Number(cargo.monto_pagado);
      if (pendiente > 0) {
        this.totalPendiente += pendiente;
        alumnosConDeuda.add(cargo.alumno_id);
      }
    }

    this.totalAlumnosConDeuda = alumnosConDeuda.size;
  }

  saldoPendienteAlumno(alumnoId: number): number {
    return this.cargos
      .filter(c => c.alumno_id === alumnoId)
      .reduce((acc, c) => acc + (Number(c.monto_total) - Number(c.monto_pagado)), 0);
  }

  // ── BÚSQUEDA ──────────────────────────────────────

  filtrar() {
    const txt = this.searchText.toLowerCase();
    this.alumnosFiltrados = this.alumnos.filter(a =>
      (a.nombre || '').toLowerCase().includes(txt) ||
      `${a.grado}${a.grupo}`.toLowerCase().includes(txt)
    );
  }

  // ── SELECCIONAR ALUMNO ────────────────────────────

  async seleccionarAlumno(alumno: any) {
    this.alumnoSeleccionado = alumno;
    await this.cargarCargosAlumno(alumno.id);
  }

  cerrarAlumno() {
    this.alumnoSeleccionado = null;
    this.cargosAlumno = [];
  }

  // ── CARGO INDIVIDUAL ──────────────────────────────

  abrirModalCargo() {
    this.cargoForm = {
      alumno_id: this.alumnoSeleccionado?.id || '',
      concepto_id: '',
      concepto_nombre: '',
      monto_total: '',
      fecha_cargo: new Date().toISOString().split('T')[0],
      fecha_vence: '',
      notas: ''
    };
    this.modalCargo = true;
  }

  onConceptoChange() {
    const c = this.conceptos.find(x => x.id == this.cargoForm.concepto_id);
    if (c) {
      this.cargoForm.concepto_nombre = c.nombre;
      this.cargoForm.monto_total = c.monto;
    }
  }

  async guardarCargo() {
    if (this.guardando) return;

    if (!this.cargoForm.concepto_nombre?.trim()) {
      alert('El nombre del cargo es obligatorio');
      return;
    }

    if (!this.cargoForm.monto_total || Number(this.cargoForm.monto_total) <= 0) {
      alert('El monto debe ser mayor a $0');
      return;
    }

    this.guardando = true;

    const payload = {
      alumno_id: this.cargoForm.alumno_id,
      concepto_id: this.cargoForm.concepto_id || null,
      concepto_nombre: this.cargoForm.concepto_nombre?.trim(),
      monto_total: Number(this.cargoForm.monto_total),
      monto_pagado: 0,
      fecha_cargo: this.cargoForm.fecha_cargo,
      fecha_vence: this.cargoForm.fecha_vence || null,
      estado: 'pendiente',
      notas: this.cargoForm.notas?.trim() || null
    };

    console.log('Guardando cargo:', payload);

    try {
      const result = await this.finanzasService.crearCargo(payload);
      console.log('Resultado cargo:', result);

      if (result?.error) {
        alert('Error al guardar el cargo: ' + result.error.message);
        this.guardando = false;
        return;
      }

      this.guardando = false;
      this.modalCargo = false;
      this.cdr.detectChanges();
      this.cargarCargosAlumno(this.alumnoSeleccionado.id);
      this.cargarTodosLosCargos();

    } catch (e) {
      console.error('Excepción cargo:', e);
      this.guardando = false;
    }
  }

  async eliminarCargo(id: number) {
    if (!confirm('¿Eliminar este cargo?')) return;
    try {
      await this.finanzasService.eliminarCargo(id);
      this.cargarCargosAlumno(this.alumnoSeleccionado.id);
      this.cargarTodosLosCargos();
    } catch (e) { console.error(e); }
  }

  // ── REGISTRAR PAGO ────────────────────────────────

  abrirModalPago(cargo: any) {
    this.cargoSeleccionado = cargo;
    const pendiente = Number(cargo.monto_total) - Number(cargo.monto_pagado);
    this.pagoForm = {
      monto: pendiente,
      metodo: 'efectivo',
      referencia: '',
      fecha_pago: new Date().toISOString().split('T')[0],
      notas: ''
    };
    this.modalPago = true;
  }

  async registrarPago() {
    if (this.guardando) return;
    this.guardando = true;

    const monto = Number(this.pagoForm.monto);
    const pendiente = Number(this.cargoSeleccionado.monto_total) - Number(this.cargoSeleccionado.monto_pagado);

    if (monto <= 0 || monto > pendiente) {
      alert(`El monto debe ser entre $1 y $${pendiente.toFixed(2)}`);
      this.guardando = false;
      return;
    }

    const nuevoPagado = Number(this.cargoSeleccionado.monto_pagado) + monto;
    const nuevoEstado = nuevoPagado >= Number(this.cargoSeleccionado.monto_total)
      ? 'pagado' : 'parcial';

    try {
      const pago = {
        cargo_id: this.cargoSeleccionado.id,
        alumno_id: this.cargoSeleccionado.alumno_id,
        monto,
        metodo: this.pagoForm.metodo,
        referencia: this.pagoForm.referencia?.trim() || null,
        fecha_pago: this.pagoForm.fecha_pago,
        notas: this.pagoForm.notas?.trim() || null
      };

      console.log('Registrando pago:', pago);

      const { error: errorPago } = await this.finanzasService.registrarPago(pago);
      if (errorPago) {
        console.error('Error pago:', errorPago);
        alert('Error al registrar pago: ' + errorPago.message);
        this.guardando = false;
        return;
      }

      const { error: errorCargo } = await this.finanzasService.actualizarCargo(
        this.cargoSeleccionado.id,
        { monto_pagado: nuevoPagado, estado: nuevoEstado }
      );
      if (errorCargo) { console.error('Error actualizar cargo:', errorCargo); }

      this.guardando = false;
      this.modalPago = false;
      this.cdr.detectChanges();
      this.cargarCargosAlumno(this.alumnoSeleccionado.id);
      this.cargarTodosLosCargos();

    } catch (e) {
      console.error('Excepción pago:', e);
      this.guardando = false;
    }
  }

  // ── ASIGNAR EN MASA ───────────────────────────────

  abrirModalAsignar() {
    this.asignarForm = {
      concepto_id: '',
      concepto_nombre: '',
      monto_total: '',
      fecha_cargo: new Date().toISOString().split('T')[0],
      fecha_vence: '',
      alcance: 'todos',
      grado: '',
      grupo: '',
      notas: ''
    };
    this.modalAsignar = true;
  }

  onConceptoAsignarChange() {
    const c = this.conceptos.find(x => x.id == this.asignarForm.concepto_id);
    if (c) {
      this.asignarForm.concepto_nombre = c.nombre;
      this.asignarForm.monto_total = c.monto;
    }
  }

  async guardarAsignacion() {
    if (this.guardando) return;

    if (!this.asignarForm.concepto_nombre?.trim()) {
      alert('El nombre del cargo es obligatorio');
      return;
    }

    if (!this.asignarForm.monto_total || Number(this.asignarForm.monto_total) <= 0) {
      alert('El monto debe ser mayor a $0');
      return;
    }

    this.guardando = true;

    let alumnosDestino = [...this.alumnos];

    if (this.asignarForm.alcance === 'grado') {
      alumnosDestino = this.alumnos.filter(a =>
        String(a.grado) === String(this.asignarForm.grado)
      );
    } else if (this.asignarForm.alcance === 'grupo') {
      alumnosDestino = this.alumnos.filter(a =>
        String(a.grado) === String(this.asignarForm.grado) &&
        a.grupo === this.asignarForm.grupo
      );
    } else if (this.asignarForm.alcance === 'individual') {
      alumnosDestino = this.alumnos.filter(a =>
        a.id === Number(this.asignarForm.alumno_individual)
      );
    }

    if (alumnosDestino.length === 0) {
      alert('No hay alumnos que coincidan con el criterio seleccionado');
      this.guardando = false;
      return;
    }

    const cargos = alumnosDestino.map(a => ({
      alumno_id: a.id,
      concepto_id: this.asignarForm.concepto_id || null,
      concepto_nombre: this.asignarForm.concepto_nombre?.trim(),
      monto_total: Number(this.asignarForm.monto_total),
      monto_pagado: 0,
      fecha_cargo: this.asignarForm.fecha_cargo,
      fecha_vence: this.asignarForm.fecha_vence || null,
      estado: 'pendiente',
      notas: this.asignarForm.notas?.trim() || null
    }));

    console.log('Asignando cargos:', cargos);

    try {
      const result = await this.finanzasService.crearCargosEnMasa(cargos);
      console.log('Resultado asignación:', result);

      if (result?.error) {
        alert('Error al asignar cargos: ' + result.error.message);
        this.guardando = false;
        return;
      }

      this.guardando = false;
      this.modalAsignar = false;
      this.cdr.detectChanges();
      this.cargarTodosLosCargos();
      alert(`✅ Cargo asignado a ${alumnosDestino.length} alumno(s)`);

    } catch (e) {
      console.error('Excepción asignación:', e);
      this.guardando = false;
    }
  }

  // ── CONCEPTOS ─────────────────────────────────────

  abrirNuevoConcepto() {
    this.editandoConcepto = false;
    this.conceptoId = 0;
    this.conceptoForm = { nombre: '', descripcion: '', monto: '', tipo: 'unico' };
    this.modalConcepto = true;
  }

  editarConcepto(c: any) {
    this.editandoConcepto = true;
    this.conceptoId = c.id;
    this.conceptoForm = {
      nombre: c.nombre,
      descripcion: c.descripcion || '',
      monto: c.monto,
      tipo: c.tipo
    };
    this.modalConcepto = true;
  }

  async guardarConcepto() {
    if (this.guardando) return;

    if (!this.conceptoForm.nombre?.trim()) {
      alert('El nombre del concepto es obligatorio');
      return;
    }

    if (!this.conceptoForm.monto || Number(this.conceptoForm.monto) <= 0) {
      alert('El monto debe ser mayor a $0');
      return;
    }

    this.guardando = true;

    const payload = {
      nombre: this.conceptoForm.nombre?.trim(),
      descripcion: this.conceptoForm.descripcion?.trim() || '',
      monto: Number(this.conceptoForm.monto),
      tipo: this.conceptoForm.tipo,
      activo: true
    };

    console.log('Guardando concepto:', payload);

    try {
      let result;

      if (this.editandoConcepto) {
        result = await this.finanzasService.actualizarConcepto(this.conceptoId, payload);
      } else {
        result = await this.finanzasService.crearConcepto(payload);
      }

      console.log('Resultado concepto:', result);

      if (result?.error) {
        alert('Error al guardar concepto: ' + result.error.message);
        this.guardando = false;
        return;
      }

      this.guardando = false;
      this.modalConcepto = false;
      this.cdr.detectChanges();
      this.cargarConceptos();

    } catch (e) {
      console.error('Excepción concepto:', e);
      this.guardando = false;
    }
  }

  // ── HELPERS ───────────────────────────────────────

  estadoClass(estado: string) {
    return {
      'estado-pendiente': estado === 'pendiente',
      'estado-parcial':   estado === 'parcial',
      'estado-pagado':    estado === 'pagado',
      'estado-cancelado': estado === 'cancelado'
    };
  }

  tipoLabel(tipo: string) {
    const map: any = {
      unico:   'Único',
      mensual: 'Mensual',
      anual:   'Anual',
      general: 'General',
      comedor: 'Comedor'
    };
    return map[tipo] || tipo;
  }

  pendienteCargo(cargo: any): number {
    return Number(cargo.monto_total) - Number(cargo.monto_pagado);
  }

  irDashboard() {
    this.router.navigate(['/dashboard']);
  }
}