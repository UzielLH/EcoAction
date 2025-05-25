import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forbiddenName } from '../../validators/forbiddenName';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CreacionEmpresaService } from '../../services/CreacionEmpresa.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-empresa',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './crearEmpresa.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearEmpresaComponent { 
  private fb=inject(FormBuilder);
  private creacionEmpresaService = inject(CreacionEmpresaService);
  registerEmpresa!: FormGroup;

  constructor(){
    this.registerEmpresa=this.fb.group({
      nombre: ['',  [Validators.required, Validators.minLength(5)]],
      username:['', [Validators.required, Validators.minLength(5), forbiddenName()]],
      email: ['',[Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
      direccion:['',[Validators.required, Validators.minLength(15)]],
      fechaNacimiento: ['', [Validators.required]],
      telefono:['',[Validators.required, Validators.pattern('^[0-9+]{10,15}$')]],
      horario:['', [Validators.required, Validators.minLength(5)]],
      latitud:['', [Validators.required, Validators.pattern('^-?([1-8]?[0-9]|90)\\.\\d+$')]],
      file:['', [Validators.required]],
      longitud:['', [Validators.required, Validators.pattern('^-?((1[0-7][0-9])|([1-9]?[0-9]))\\.\\d+$')]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  validarEntradaTelefono(event: KeyboardEvent) {
    const tecla = event.key;
    const permitidos = /^[0-9+]$/; // Solo números y el símbolo +
    if (!permitidos.test(tecla)) {
      event.preventDefault(); // Bloquea la entrada si no es válida
    }
  }
  
  
registroEmpresa() {
  if (this.registerEmpresa.invalid) {
    this.registerEmpresa.markAllAsTouched();
    return;
  }

  const empresaData = this.registerEmpresa.value;
  // Get file from form control for later use
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  const imageFile = fileInput?.files?.[0];
  
  if (!imageFile) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor selecciona una imagen para la empresa',
      confirmButtonColor: '#d33',
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  // First create the company
  this.creacionEmpresaService.crearEmpresa(empresaData)
    .then(response => {
      // Extract company ID from response
      const empresaId = response.id;
      
      if (!empresaId) {
        throw new Error('No se pudo obtener el ID de la empresa creada');
      }
      
      // Now upload the image with the company ID
      return this.creacionEmpresaService.subirImagen(empresaId, imageFile);
    })
    .then(() => {
      // Show success message after both operations complete
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'La empresa ha sido creada y la imagen ha sido subida exitosamente.',
        timer: 2000,
        showConfirmButton: false
      });
    })
    .catch(error => {
      // Handle errors from either operation
      const errorMessage = error?.message || 'Ocurrió un error al crear la empresa. Por favor, inténtalo de nuevo.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Aceptar'
      });
      console.error('Error en el proceso de registro:', error);
    });
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

