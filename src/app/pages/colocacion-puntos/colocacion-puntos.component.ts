import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2'; // Añade esta línea para importar SweetAlert2

@Component({
  selector: 'app-colocacion-puntos',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './colocacion-puntos.component.html',
  styles: ``
})
export class ColocacionPuntosComponent implements OnInit {
  @ViewChild('usernameInput') usernameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('puntosInput') puntosInput!: ElementRef<HTMLInputElement>;
  
  puntosForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.puntosForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      puntos: ['', [Validators.required, Validators.min(1)]]
    });
  }

  clearInputs(): void {
    this.puntosForm.reset();
  }

  obtenerMensajesError(controlName: string) {
    const control = this.puntosForm.get(controlName);
    const mensajes: string[] = [];

    if (control?.errors && (control?.touched || control?.dirty)) {
      Object.keys(control.errors).forEach(keyError => {
        if (controlName === 'username') {
          switch (keyError) {
            case 'required':
              mensajes.push('POR FAVOR INGRESA UN NOMBRE DE USUARIO');
              break;
            case 'minlength':
              mensajes.push('EL NOMBRE DE USUARIO DEBE TENER AL MENOS 3 CARACTERES');
              break;
          }
        } else if (controlName === 'puntos') {
          switch (keyError) {
            case 'required':
              mensajes.push('DEBES INGRESAR UNA CANTIDAD DE PUNTOS');
              break;
            case 'min':
              mensajes.push('LOS PUNTOS DEBEN SER UN NÚMERO POSITIVO MAYOR A 0');
              break;
          }
        }
      });
    }
    return mensajes;
  }

  onSubmit() {
    if (this.puntosForm.valid) {
      // Mostrar SweetAlert de éxito
      Swal.fire({
        title: '¡Éxito!',
        text: `Se han añadido ${this.puntosForm.value.puntos} puntos al usuario ${this.puntosForm.value.username}`,
        icon: 'success',
        confirmButtonColor: '#3be019', // Color verde acorde a tu paleta
        background: '#ffffff', // Fondo blanco
        iconColor: '#3be019' // Cambiado a verde para el icono de éxito
      });
      
      console.log('Formulario enviado:', this.puntosForm.value);
      this.clearInputs();
    } else {
      // Marcar todos los campos como touched para mostrar los errores
      this.puntosForm.markAllAsTouched();
      
      // Opcionalmente, mostrar SweetAlert de error
      Swal.fire({
        title: 'Error',
        text: 'Por favor, completa correctamente todos los campos',
        icon: 'error',
        confirmButtonColor: '#e0cb19',
        background: '#ffffff', // Fondo blanco
        iconColor: '#e01919' // Cambiado a rojo para el icono de error
      });
    }
  }
}