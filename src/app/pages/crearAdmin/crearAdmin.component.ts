import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forbiddenName } from '../../validators/forbiddenName';
import { CreacionAdminService } from '../../services/CreacionAdmin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-admin',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './crearAdmin.component.html',
  styles: `
    :host {
      display: block;
    }
    
    /* Estilos para los campos de fecha */
    input[type="date"] {
      appearance: textfield;
    }
    
    /* Personalizar el campo de fecha */
    input[type="date"]::-webkit-calendar-picker-indicator {
      color: rgba(0, 0, 0, 0);
      opacity: 1;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 24 24"><path fill="%2375c46b" d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>');
      width: 20px;
      height: 20px;
      cursor: pointer;
      position: absolute;
      right: 8px;
      top: calc(50% - 10px);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearAdminComponent {
  private fb = inject(FormBuilder);
  private creacionAdminService = inject(CreacionAdminService);
  registerAdmin!: FormGroup;
  esUsuario: boolean = true; 
  showPassword: boolean = false;

  constructor() {
    this.registerAdmin = this.fb.group({
      nombre: ['',  [Validators.required, Validators.minLength(5)]],
      apellidos: ['', [Validators.required, Validators.minLength(5)]],
      username: ['', [Validators.required, Validators.minLength(5), forbiddenName()]],
      fechaNacimiento: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
    });
  }

  toggleForm() {
    this.esUsuario = !this.esUsuario;
  }
  
  // Método para alternar visibilidad de contraseña
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  validarEntradaTelefono(event: KeyboardEvent) {
    const tecla = event.key;
    const permitidos = /^[0-9+]$/; // Solo números y el símbolo +
    if (!permitidos.test(tecla)) {
      event.preventDefault(); // Bloquea la entrada si no es válida
    }
  }
  
  register() {
    if (this.registerAdmin.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      this.registerAdmin.markAllAsTouched();
      
      // Mostrar mensaje más descriptivo sobre los campos faltantes
      const camposFaltantes = Object.keys(this.registerAdmin.controls)
        .filter(key => this.registerAdmin.get(key)?.invalid)
        .map(key => this.obtenerEtiquetaCampo(key));
      
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        html: `Por favor, completa correctamente los siguientes campos:<br><br>
              <ul style="text-align: left; display: inline-block;">
                ${camposFaltantes.map(campo => `<li>• ${campo}</li>`).join('')}
              </ul>`,
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Mostrar indicador de carga durante el registro
    Swal.fire({
      title: 'Creando cuenta de administrador',
      text: 'Esto puede tomar unos momentos...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const adminData = this.registerAdmin.value;
    
    // Eliminar el campo aceptaPoliticas antes de enviar al servidor
    delete adminData.aceptaPoliticas;
    
    this.creacionAdminService.crearAdmin(adminData)
      .then(response => {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'La cuenta de administrador ha sido creada exitosamente.',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Aceptar'
        });
        
        // Resetear formulario después del éxito
        this.registerAdmin.reset();
      })
      .catch(error => {
        const errorMessage = error?.message || 'Ocurrió un error al crear el administrador. Por favor, inténtalo de nuevo.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: '#d33',
          confirmButtonText: 'Aceptar'
        });
        console.error('Error al crear el administrador:', error);
      });
  }

  obtenerMensajesError(controlName: string) {
    const control = this.registerAdmin.get(controlName);
    const mensajes: any[] = [];
    if (control?.errors && control?.touched) {
      Object.keys(control.errors).forEach(keyError => {
        switch (keyError) {
          case 'required':
            mensajes.push('Este campo es requerido');
            break;
          case 'requiredTrue':
            mensajes.push('Debes aceptar los términos y condiciones');
            break;
          case 'maxlength':
            mensajes.push('Excedió el máximo de caracteres');
            break;
          case 'minlength':
            mensajes.push('El campo necesita el mínimo de caracteres');
            break;
          case 'forbiden':
            mensajes.push('Ese usuario no está disponible');
            break;
          case 'pattern':
            if (controlName === 'email') {
              mensajes.push('Ingresa un correo electrónico válido');
            } else if (controlName === 'password') {
              mensajes.push('La contraseña no cumple con los requisitos de seguridad');
            } else {
              mensajes.push('El formato no es correcto');
            }
            break;
          case 'forbiddenName':
            mensajes.push('Ese usuario no está disponible');
            break;
        }
      });
    }
    return mensajes;
  }
  
  // Método auxiliar para obtener etiquetas de los campos para mensajes de error
  private obtenerEtiquetaCampo(controlName: string): string {
    const etiquetas: {[key: string]: string} = {
      'nombre': 'Nombre',
      'apellidos': 'Apellidos',
      'username': 'Nombre de usuario',
      'fechaNacimiento': 'Fecha de nacimiento',
      'email': 'Correo electrónico',
      'password': 'Contraseña',
      'aceptaPoliticas': 'Términos y políticas'
    };
    
    return etiquetas[controlName] || controlName;
  }
}