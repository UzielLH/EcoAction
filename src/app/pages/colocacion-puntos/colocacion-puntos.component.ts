import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { PuntosService } from '../../services/Puntos.service';

@Component({
  selector: 'app-colocacion-puntos',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './colocacion-puntos.component.html',
  styles: ``
})
export class ColocacionPuntosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private puntosService = inject(PuntosService);
  
  puntosForm!: FormGroup;
  isSubmitting = false;
  successMessage: string | null = null;

  
  ngOnInit(): void {
    this.puntosForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      puntos: ['', [Validators.required, Validators.min(1)]]
    });
  }

  clearInputs(): void {
    this.puntosForm.reset();
    this.successMessage = null; // Limpiar el mensaje de éxito al borrar
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
    if (this.puntosForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.successMessage = null; // Limpiar mensaje de éxito previo

      
      const datos = {
        username: this.puntosForm.value.username,
        puntos: this.puntosForm.value.puntos,
        uuidKeycloak: localStorage.getItem('userUuid') || '' // Importante: incluir el UUID
      };
      
      // Mostrar indicador de carga
      Swal.fire({
        title: 'Procesando...',
        text: 'Asignando puntos al usuario',
        icon: 'info',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      // Llamar al servicio
      this.puntosService.asignarPuntos(datos)
        .subscribe({
          next: (response) => {
            console.log('Respuesta:', response);
            this.isSubmitting = false;
            
            // Configurar mensaje de éxito para mostrar en el formulario
            this.successMessage = `¡Se han añadido ${datos.puntos} puntos al usuario ${datos.username}!`;
            
            // Mostrar alerta de éxito
            Swal.fire({
              title: '¡Éxito!',
              text: `Se han añadido ${datos.puntos} puntos al usuario ${datos.username}`,
              icon: 'success',
              confirmButtonColor: '#3be019',
              background: '#ffffff',
              iconColor: '#3be019'
            });
            
            // Auto-ocultar el mensaje de éxito después de 5 segundos
            setTimeout(() => {
              this.successMessage = null;
            }, 5000);
          },
          error: (error) => {
            console.error('Error al asignar puntos:', error);
            this.isSubmitting = false;
            
            // Eliminar esta línea incorrecta - no debemos mostrar mensaje de éxito en caso de error
            // this.successMessage = `¡Se han añadido ${datos.puntos} puntos al usuario ${datos.username}!`;
            
            Swal.fire({
              title: 'Error',
              text: this.getErrorMessage(error),
              icon: 'error',
              confirmButtonColor: '#e0cb19',
              background: '#ffffff',
              iconColor: '#e01919'
            });
          }
        });
    } else {
      // Marcar todos los campos como touched para mostrar los errores
      this.puntosForm.markAllAsTouched();
      
      Swal.fire({
        title: 'Error',
        text: 'Por favor, completa correctamente todos los campos',
        icon: 'error',
        confirmButtonColor: '#e0cb19',
        background: '#ffffff',
        iconColor: '#e01919'
      });
    }
  }
  
  // Método para obtener mensajes de error más descriptivos
  private getErrorMessage(error: any): string {
    if (error.status === 404) {
      return 'El usuario especificado no existe.';
    } else if (error.status === 401 || error.status === 403) {
      return 'No tienes permiso para asignar puntos. Por favor, inicia sesión nuevamente.';
    } else if (error.error && error.error.message) {
      return error.error.message;
    } else {
      return 'Ocurrió un error al asignar los puntos. Inténtalo de nuevo más tarde.';
    }
  }
}