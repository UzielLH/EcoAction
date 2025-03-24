import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forbiddenName } from '../../validators/forbiddenName';

@Component({
  selector: 'app-sign-up',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styles: ``
})
export class SignUpComponent {
  private fb=inject(FormBuilder);
  registerForm!: FormGroup;
  constructor(){
    this.registerForm=this.fb.group({
      nombre: ['',  [Validators.required, Validators.minLength(5)]],
      usuario: ['', [Validators.required, Validators.minLength(5), forbiddenName()]],
      email: ['',[Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  register(){
    if(this.registerForm.invalid){
      this.registerForm.markAllAsTouched();
      return;
    }
    console.log('Registrando...', this.registerForm.value);
  }

  obtenerMensajesError(controlName: string) {
    const control = this.registerForm.get(controlName);
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
