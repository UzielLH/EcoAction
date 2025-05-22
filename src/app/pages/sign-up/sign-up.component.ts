import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forbiddenName } from '../../validators/forbiddenName';
import { CommonModule } from '@angular/common';
import { CreacionUserService } from '../../services/CreacionUser.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-up',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './sign-up.component.html',
  styles: ``
})
export class SignUpComponent {
  private fb=inject(FormBuilder);
  private creacionUserService=inject(CreacionUserService);
  private router = inject(Router);
  registerUsuario!: FormGroup;  
  esUsuario: boolean = true; 

  constructor(){
    this.registerUsuario=this.fb.group({
      nombre: ['',  [Validators.required, Validators.minLength(2)]],
      apellidos:['', [Validators.required, Validators.minLength(5)]],
      username: ['', [Validators.required, Validators.minLength(5), forbiddenName()]],
      fechaNacimiento: ['', [Validators.required]],
      email: ['',[Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

  }

  toggleForm() {
    this.esUsuario = !this.esUsuario;
  }

  validarEntradaTelefono(event: KeyboardEvent) {
    const tecla = event.key;
    const permitidos = /^[0-9+]$/; // Solo números y el símbolo +
    if (!permitidos.test(tecla)) {
      event.preventDefault(); // Bloquea la entrada si no es válida
    }
  }
  
  register() {
    if (this.registerUsuario.invalid) {
      this.registerUsuario.markAllAsTouched();
      return;
    }

    const usuarioData = this.registerUsuario.value;
    this.creacionUserService.crearUsuario(usuarioData)
      .then(response => {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El usuario ha sido creado exitosamente.',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      })
      .catch(error => {
        const errorMessage = error?.message || 'Ocurrió un error al crear el usuario. Por favor, inténtalo de nuevo.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: '#d33',
          confirmButtonText: 'Aceptar'
        });
        console.error('Error al crear el usuario:', error);
      });
  }



  obtenerMensajesError(controlName: string) {
    const control = this.registerUsuario.get(controlName);
    const mensajes: any[] = [];
    if (control?.errors && control?.touched) {
      Object.keys(control.errors).forEach(keyError => {
        switch (keyError) {
          case 'required':
            mensajes.push('Este campo es requerido');
            break;
          case 'maxlength':
            mensajes.push('Excedió el maximo de caracteres');
            break;
          case 'minlength':
            mensajes.push('El campo necesita el mínimo de caracteres');
            break;
          case 'forbiden':
            mensajes.push('Ese usuario no esta disponible');
            break;
          case 'pattern':
            mensajes.push('El formato no es correcto');
            break;
          case 'forbiddenName':
            mensajes.push('Ese usuario no esta disponible');
            break;
          
        }
      });
    }
    return mensajes;
  }
}
