
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

interface Producto {
  nombre: string;
  categoria: string;
  telefono: string;
  stock: number;
  precio: number;
  fechaIngreso: string;
}

// VALIDACIÓN PERSONALIZADA: teléfono de exactamente 9 dígitos
function telefonoPeruano(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;

  const telefono = String(control.value);

  return /^[0-9]{9}$/.test(telefono)
    ? null
    : { telefonoInvalido: true };
}

// VALIDACIÓN PERSONALIZADA: fecha no anterior a hoy
function fechaNoAnterior(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;

  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');

  const fechaActual = `${anio}-${mes}-${dia}`;

  return control.value < fechaActual
    ? { fechaAnterior: true }
    : null;
}

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css'
})
export class Inventario {

  formulario: FormGroup;
  productos: Producto[] = [];
  indiceEditar: number | null = null;

  fechaMinima = this.obtenerFechaActual();

  constructor(private fb: FormBuilder) {

    this.formulario = this.fb.group({

      nombre: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9 ]+$/)
      ]],

      categoria: ['', [
        Validators.required
      ]],

      telefono: ['', [
        Validators.required,
        telefonoPeruano
      ]],

      stock: [0, [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^[0-9]+$/)
      ]],

      precio: ['', [
        Validators.required,
        Validators.min(0.01)
      ]],

      fechaIngreso: ['', [
        Validators.required,
        fechaNoAnterior
      ]]

    });
  }

  obtenerFechaActual(): string {
    const hoy = new Date();

    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  guardarProducto(): void {

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const producto = this.formulario.getRawValue() as Producto;

    if (this.indiceEditar !== null) {

      this.productos[this.indiceEditar] = producto;
      this.indiceEditar = null;

    } else {

      this.productos.push(producto);

    }

    this.formulario.reset({
      nombre: '',
      categoria: '',
      telefono: '',
      stock: 0,
      precio: '',
      fechaIngreso: ''
    });
  }

  editarProducto(index: number): void {

    this.indiceEditar = index;

    this.formulario.patchValue(this.productos[index]);

  }

  eliminarProducto(index: number): void {

    this.productos.splice(index, 1);

    if (this.indiceEditar === index) {
      this.cancelarEdicion();
    } else if (
      this.indiceEditar !== null &&
      this.indiceEditar > index
    ) {
      this.indiceEditar--;
    }
  }

  cancelarEdicion(): void {

    this.indiceEditar = null;

    this.formulario.reset({
      nombre: '',
      categoria: '',
      telefono: '',
      stock: 0,
      precio: '',
      fechaIngreso: ''
    });

  }


  // Calcula la cantidad total de unidades disponibles
  obtenerTotalStock(): number {
    return this.productos.reduce(
      (total, producto) => total + Number(producto.stock),
      0
    );
  }

  // Calcula el valor económico total del inventario
  obtenerValorInventario(): number {
    return this.productos.reduce(
      (total, producto) =>
        total + Number(producto.stock) * Number(producto.precio),
      0
    );
  }


}
