import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlumnosService } from '../core/alumnos.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-alumnos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alumnos.html',
  styleUrl: './alumnos.scss'
})
export class Alumnos implements OnInit {

  modal = false;
  editando = false;
  guardando = false;
  alumnoId = 0;

  alumnos: any[] = [];
  alumnosFiltrados: any[] = [];
  alumnoForm: any = {};

  alumnosPorGrupo: any = {
    '1A': 0, '1B': 0,
    '2A': 0, '2B': 0,
    '3A': 0, '3B': 0
  };

  graduadosCount = 0;
  activosCount = 0;
  searchText: string = '';

  constructor(
    private alumnosService: AlumnosService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  async ngOnInit() {
    this.alumnoForm = this.nuevoAlumno();
    await this.cargarAlumnos();
  }

  nuevoAlumno() {
    return {
      nombre: '',
      curp: '',
      nacimiento: '',
      grado: '1',
      grupo: 'A',
      domicilio: '',
      estado: 'Activo',
      foto: 'https://i.pravatar.cc/60',
      contactos: [''],
      alergias: ['']
    };
  }

  async cargarAlumnos() {
    try {
      const { data, error } = await this.alumnosService.obtenerAlumnos();

      if (error) {
        console.error(error);
        return;
      }

      this.alumnos = data || [];
      this.alumnosFiltrados = [...this.alumnos];
      this.recalcularEstadisticas();
      this.cdr.detectChanges();

    } catch (error) {
      console.error(error);
    }
  }

  recalcularEstadisticas() {
    this.alumnosPorGrupo = {
      '1A': 0, '1B': 0,
      '2A': 0, '2B': 0,
      '3A': 0, '3B': 0
    };

    this.graduadosCount = 0;
    this.activosCount = 0;

    for (let alumno of this.alumnos) {
      const clave = `${alumno.grado}${alumno.grupo}`;

      if (alumno.estado === 'Activo') {
        this.activosCount++;
        if (this.alumnosPorGrupo[clave] !== undefined) {
          this.alumnosPorGrupo[clave]++;
        }
      }

      if (alumno.estado === 'Graduado') {
        this.graduadosCount++;
      }
    }
  }

  filtrarAlumnos() {
    const texto = this.searchText.toLowerCase();

    this.alumnosFiltrados = this.alumnos.filter(alumno => {
      const nombre = alumno.nombre?.toLowerCase() || '';
      const grupo = `${alumno.grado}${alumno.grupo}`.toLowerCase();
      return nombre.includes(texto) || grupo.includes(texto);
    });
  }

  abrirNuevo() {
    this.editando = false;
    this.alumnoId = 0;
    this.alumnoForm = this.nuevoAlumno();
    this.modal = true;
  }

  editarAlumno(alumno: any) {
    this.editando = true;
    this.alumnoId = alumno.id;

    this.alumnoForm = {
      nombre: alumno.nombre || '',
      curp: alumno.curp || '',
      nacimiento: alumno.nacimiento || '',
      grado: alumno.grado || '1',
      grupo: alumno.grupo || 'A',
      domicilio: alumno.domicilio || '',
      estado: alumno.estado || 'Activo',
      foto: alumno.foto || 'https://i.pravatar.cc/60',
      contactos: alumno.contactos || [''],
      alergias: alumno.alergias || ['']
    };

    this.modal = true;
  }

  async guardarAlumno() {
    if (this.guardando) return;
    this.guardando = true;

    const payload = {
      nombre: this.alumnoForm.nombre?.trim(),
      curp: this.alumnoForm.curp?.trim(),
      nacimiento: this.alumnoForm.nacimiento || null,
      grado: this.alumnoForm.grado,
      grupo: this.alumnoForm.grupo,
      domicilio: this.alumnoForm.domicilio?.trim(),
      estado: this.alumnoForm.estado,
      foto: this.alumnoForm.foto,
      contactos: this.alumnoForm.contactos || [],
      alergias: this.alumnoForm.alergias || []
    };

    try {
      let result;

      if (this.editando) {
        result = await this.alumnosService.actualizarAlumno(this.alumnoId, payload);
      } else {
        result = await this.alumnosService.crearAlumno(payload);
      }

      if (result?.error) {
        alert('No se pudo guardar');
        this.guardando = false;
        return;
      }

      this.guardando = false;
      this.cerrarModal();
      this.cdr.detectChanges();

      this.cargarAlumnos();

    } catch (error) {
      console.error(error);
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  cerrarModal() {
    this.modal = false;
  }

  agregarContacto() {
    this.alumnoForm.contactos.push('');
  }

  eliminarContacto(i: number) {
    this.alumnoForm.contactos.splice(i, 1);
  }

  agregarAlergia() {
    this.alumnoForm.alergias.push('');
  }

  eliminarAlergia(i: number) {
    this.alumnoForm.alergias.splice(i, 1);
  }

  trackByIndex(index: number): number {
    return index;
  }

  irDashboard() {
    this.router.navigate(['/dashboard']);
  }

  async eliminarAlumno(id: number) {
    const confirmar = confirm('¿Seguro que deseas eliminar este alumno?');
    if (!confirmar) return;

    try {
      const { error } = await this.alumnosService.eliminarAlumno(id);

      if (error) {
        console.error(error);
        alert('No se pudo eliminar el alumno');
        return;
      }

      this.cargarAlumnos();

    } catch (error) {
      console.error(error);
    }
  }
}