import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MaestrosService } from '../core/maestros.service';

@Component({
  selector: 'app-maestros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './maestros.html',
  styleUrl: './maestros.scss'
})
export class Maestros implements OnInit {

  modal = false;
  editando = false;
  guardando = false;
  maestroId = 0;

  maestros: any[] = [];
  maestrosFiltrados: any[] = [];
  maestroForm: any = {};

  activosCount = 0;
  searchText = '';

  constructor(
    private maestrosService: MaestrosService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.maestroForm = this.nuevoMaestro();

    setTimeout(() => {
      this.cargarMaestros();
    }, 0);
  }

  nuevoMaestro() {
    return {
      nombre: '',
      curp: '',
      cedula: '',
      grupos: [''],
      domicilio: '',
      contactos: [''],
      carrera: '',
      estado: 'Activo',
      foto: 'https://i.pravatar.cc/60?img=12'
    };
  }

  async cargarMaestros() {
    try {
      const { data, error } = await this.maestrosService.obtenerMaestros();

      if (error) {
        console.error(error);
        return;
      }

      this.maestros = [];

      setTimeout(() => {
        this.maestros = data || [];
        this.maestrosFiltrados = [...this.maestros];
        this.recalcular();
        this.cdr.detectChanges();
      }, 0);

    } catch (error) {
      console.error(error);
    }
  }

  recalcular() {
    this.activosCount = this.maestros.filter(
      x => x.estado === 'Activo'
    ).length;
  }

  filtrar() {
    const txt = this.searchText.toLowerCase();

    this.maestrosFiltrados = this.maestros.filter(m =>
      (m.nombre || '').toLowerCase().includes(txt)
    );
  }

  abrirNuevo() {
    this.editando = false;
    this.maestroId = 0;
    this.maestroForm = this.nuevoMaestro();
    this.modal = true;
  }

  editar(maestro: any) {
    this.editando = true;
    this.maestroId = maestro.id;

    this.maestroForm = {
      nombre: maestro.nombre || '',
      curp: maestro.curp || '',
      cedula: maestro.cedula || '',
      grupos: maestro.grupos || [''],
      domicilio: maestro.domicilio || '',
      contactos: maestro.contactos || [''],
      carrera: maestro.carrera || '',
      estado: maestro.estado || 'Activo',
      foto: maestro.foto || 'https://i.pravatar.cc/60?img=12'
    };

    this.modal = true;
  }

  async guardar() {

    if (this.guardando) return;

    this.guardando = true;

    const payload = {
      nombre: this.maestroForm.nombre?.trim(),
      curp: this.maestroForm.curp?.trim(),
      cedula: this.maestroForm.cedula?.trim(),
      grupos: this.maestroForm.grupos || [],
      domicilio: this.maestroForm.domicilio?.trim(),
      contactos: this.maestroForm.contactos || [],
      carrera: this.maestroForm.carrera?.trim(),
      estado: this.maestroForm.estado,
      foto: this.maestroForm.foto
    };

    try {

      let result;

      if (this.editando) {
        result = await this.maestrosService.actualizarMaestro(
          this.maestroId,
          payload
        );
      } else {
        result = await this.maestrosService.crearMaestro(payload);
      }

      if (result?.error) {
        alert('No se pudo guardar');
        return;
      }

      await this.cargarMaestros();
      this.cerrar();

    } catch (error) {
      console.error(error);
    } finally {
      this.guardando = false;
    }
  }

  cerrar() {
    this.modal = false;
  }

  agregarGrupo() {
    this.maestroForm.grupos.push('');
  }

  eliminarGrupo(i: number) {
    this.maestroForm.grupos.splice(i, 1);
  }

  agregarContacto() {
    this.maestroForm.contactos.push('');
  }

  eliminarContacto(i: number) {
    this.maestroForm.contactos.splice(i, 1);
  }

  async eliminar(id: number) {

    const ok = confirm('¿Eliminar maestro?');

    if (!ok) return;

    try {
      await this.maestrosService.eliminarMaestro(id);
      await this.cargarMaestros();
    } catch (error) {
      console.error(error);
    }
  }

  irDashboard() {
    this.router.navigate(['/dashboard']);
  }

  trackByIndex(index: number) {
    return index;
  }
}
