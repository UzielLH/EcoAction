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
  imagenSeleccionada: string | ArrayBuffer | null = null;
  archivoImagen!: File;

  onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;

  if (input.files && input.files.length > 0) {
    const archivo = input.files[0];
    this.archivoImagen = archivo;

    const lector = new FileReader();
    lector.onload = () => {
      this.imagenSeleccionada = lector.result;
    };
    lector.readAsDataURL(archivo);
  }
}


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
    if (this.metaForm.invalid || !this.archivoImagen) {
      this.metaForm.markAllAsTouched();
      Swal.fire({
        title: 'Error',
        text: 'No se pudo crear la meta. Revisa los campos y selecciona una imagen.',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    const formData = new FormData();
    formData.append('nombre', this.metaForm.get('nombre')?.value);
    formData.append('cantidadMonedas', this.metaForm.get('cantidadMonedas')?.value);
    formData.append('descripcion', this.metaForm.get('descripcion')?.value);
    formData.append('imagen', this.archivoImagen);

    console.log('FormData:', formData);

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
