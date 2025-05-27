import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forbiddenName } from '../../validators/forbiddenName';

@Component({
  selector: 'app-crear-admin',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './crearAdmin.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearAdminComponent {
  private fb=inject(FormBuilder);
  registerAdmin!: FormGroup;
  esUsuario: boolean = true; 

  constructor(){
    this.registerAdmin=this.fb.group({
      nombre: ['',  [Validators.required, Validators.minLength(5)]],
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
  
  register(){
    if(this.registerAdmin.invalid){
      this.registerAdmin.markAllAsTouched();
      return;
    }
    console.log('Registrando...', this.registerAdmin.value);
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

