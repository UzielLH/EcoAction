import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
interface Meta {
  nombreMeta: string;
  cantidadMonedas: number;
  cantidadTotal: number;
  descripcion: string;
  linkImagen: string;
}
@Component({
  selector: 'app-metas',
  imports: [ CommonModule, ReactiveFormsModule],
  templateUrl: './metas.component.html',
  styles: ``
})
export class MetasComponent {
  userRole: string= "admin"; // o null si no está logueado user, empresa, admin
  mostrarFormulario = false;
  private router = inject(Router); // Definir router correctamente


  metas: Meta[] = [
    {
      nombreMeta: "Limpiar Zócalo",
      cantidadMonedas: 120,
      cantidadTotal: 500,
      descripcion: "Meta para limpiar el Zócalo de la ciudad.",
      linkImagen: "https://www.ciudadespatrimonio.mx/wp-content/uploads/2018/04/zocalo-oaxaca.jpg"
    },
    {
      nombreMeta: "Reforestar Parque",
      cantidadMonedas: 300,
      cantidadTotal: 1000,
      descripcion: "Reforestación con árboles nativos en el parque central.",
      linkImagen: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/b2/2f/b8/estatua-y-homenaje-principal.jpg?w=1200&h=-1&s=1"
    },
    {
      nombreMeta: "Alimentar Perritos Callejeros",
      cantidadMonedas: 80,
      cantidadTotal: 200,
      descripcion: "Compra de alimento para perritos en situación de calle.",
      linkImagen: "https://www.muyinteresante.com/wp-content/uploads/sites/5/2024/06/04/665f0461a9ae0.jpeg"
    },
    {
      nombreMeta: "Alimentar Perritos Callejeros",
      cantidadMonedas: 80,
      cantidadTotal: 200,
      descripcion: "Compra de alimento para perritos en situación de calle.",
      linkImagen: "https://www.muyinteresante.com/wp-content/uploads/sites/5/2024/06/04/665f0461a9ae0.jpeg"
    }
  ];
  handleDonateClick() {
    console.log("Botón de donar clickeado");
    
    if (this.userRole === "") {
      Swal.fire({
        icon: 'warning',
        title: 'No estás logueado',
        text: 'Por favor, inicia sesión para poder donar.',
      });
    } else {
      Swal.fire({
        title: 'Ingrese la cantidad a donar',
        input: 'number',
        inputAttributes: {
          min: '1',
          step: '1'
        },
        showCancelButton: true,
        confirmButtonText: 'Donar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (!value || isNaN(Number(value)) || Number(value) <= 0) {
            return 'Ingrese una cantidad válida';
          }
          return null; // ✅ Se soluciona TS7030
        }
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            icon: 'success',
            title: 'Donación realizada',
            text: `Has donado ${result.value} monedas. ¡Gracias por tu apoyo!`,
          });
        }
      });
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
      }).then(() => {
        this.mostrarFormulario = false;
        this.router.navigate(['/metas']);
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