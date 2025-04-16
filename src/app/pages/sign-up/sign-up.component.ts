import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forbiddenName } from '../../validators/forbiddenName';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-up',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './sign-up.component.html',
  styles: ``
})
export class SignUpComponent {
  private fb=inject(FormBuilder);
  registerUsuario!: FormGroup;
  registerEmpresa!: FormGroup;
  esUsuario: boolean = true; 

  constructor(){
    this.registerUsuario=this.fb.group({
      nombre: ['',  [Validators.required, Validators.minLength(5)]],
      usuario: ['', [Validators.required, Validators.minLength(5), forbiddenName()]],
      email: ['',[Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.registerEmpresa=this.fb.group({
      nombreEmpresa: ['',  [Validators.required, Validators.minLength(5)]],
      usuarioEmpresa:['', [Validators.required, Validators.minLength(5), forbiddenName()]],
      emailEmpresa: ['',[Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
      direccion:['',[Validators.required, Validators.minLength(15)]],
      telefono:['',[Validators.required, Validators.pattern('^[0-9+]{10,15}$')]],
      horario:['', [Validators.required, Validators.minLength(5)]],
      imagen: ['', [Validators.required]],
      latitud:['', [Validators.required, Validators.pattern('^-?([1-8]?[0-9]|90)\\.\\d+$')]],
      longitud:['', [Validators.required, Validators.pattern('^-?((1[0-7][0-9])|([1-9]?[0-9]))\\.\\d+$')]],
      passwordEmpresa: ['', [Validators.required, Validators.minLength(8)]]
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
    if(this.registerUsuario.invalid){
      this.registerUsuario.markAllAsTouched();
      return;
    }
    console.log('Registrando...', this.registerUsuario.value);
  }

  registroEmpresa(){
    if(this.registerEmpresa.invalid){
      this.registerEmpresa.markAllAsTouched();
      return;
    }
    console.log('Registrando...', this.registerEmpresa.value);
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

  obtenerMensajesErrorEmpresa(controlName: string) {
    const control = this.registerEmpresa.get(controlName);
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
