import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-creacion-metas',
  imports: [ReactiveFormsModule],
  templateUrl: './creacion-metas.component.html',
  styles: ``
})
export class CreacionMetasComponent {
  private fb=inject(FormBuilder);
  metaForm!: FormGroup;
  constructor(){
    this.metaForm=this.fb.group({
      nombre: ['',  [Validators.required, Validators.minLength(5)]],
      cantidadMonedas: ['', [Validators.required, Validators.min(1)]],
      descripcion: ['', [Validators.required, Validators.minLength(15)]],
      imagen: ['', [Validators.required]]
    });
  }
  register() {
    if (this.metaForm.invalid) {
      this.metaForm.markAllAsTouched();
      Swal.fire({
        title: 'Error',
        text: 'No se pudo crear la meta. Por favor, revise los campos o la conexión.',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    console.log('Registrando...', this.metaForm.value);

    Swal.fire({
      title: 'Meta creada',
      text: 'La meta ha sido creada exitosamente.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  }

  obtenerMensajesError(controlName: string) {
    const control = this.metaForm.get(controlName);
    const mensajes: any[] = [];
    if (control?.errors && control?.touched) {
      Object.keys(control.errors).forEach(keyError => {
        switch (keyError) {
          case 'required':
            mensajes.push('Este campo es requerido');
            break;
          case 'minlength':
            mensajes.push('El campo necesita el mínimo de caracteres');
            break;
          case 'pattern':
            mensajes.push('El formato no es correcto');
            break;
          case 'min':
            mensajes.push('El valor mínimo es 1');
            break;
        }
      });
    }
    return mensajes;
  }

}
