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
  saldoPersona=100;
  userRole: string = localStorage.getItem('rol') || 'user-realm-rol'; // Obtener el rol del localStorage o asignar 'user' por defecto	
  mostrarFormulario = false;
  mostrarFormularioDonacion = false;
  mostrarFormularioSaldo = false;
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
  
  
  private fb=inject(FormBuilder);
  metaForm!: FormGroup;
  donacionForm!: FormGroup;
  SaldoForm!: FormGroup;
  constructor(){
    this.metaForm=this.fb.group({
      nombre: ['',  [Validators.required, Validators.minLength(5)]],
      cantidadMonedas: ['', [Validators.required, Validators.min(1)]],
      descripcion: ['', [Validators.required, Validators.minLength(15)]],
      imagen: ['', [Validators.required]]
    });
    this.donacionForm=this.fb.group({
      cantidad: ['', [Validators.required, Validators.min(1)]]
    });
    this.SaldoForm=this.fb.group({
      saldo: ['', [Validators.required, Validators.min(1)]],
      notarjeta: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      nombreTarjeta:['',[Validators.required, Validators.minLength(5)]],
      vencimiento:['',[Validators.required, Validators.pattern('^(0[1-9]|1[0-2])/[0-9]{2}$')]],
      cvc:['',[Validators.required, Validators.pattern('^[0-9]{3}$')]]
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
        this.metaForm.reset();
        this.router.navigate(['/metas']);
      });
    }

    registerDonation() {
      if (!this.userRole) {
        Swal.fire({
          title: 'Inicia sesión',
          text: 'Debes iniciar sesión para poder realizar una donación.',
          icon: 'warning',
          timer: 2000,
          showConfirmButton: false
        });
        return; // Detener ejecución si no hay rol
      }
    
      if (this.donacionForm.invalid) {
        this.donacionForm.markAllAsTouched();
        Swal.fire({
          title: 'Error',
          text: 'No se pudo realizar la donación. Por favor, revise los campos o la conexión.',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false
        });
        return;
      }
    
      console.log('Donando...', this.donacionForm.value);
    
      Swal.fire({
        title: 'Donación realizada',
        text: 'La donación ha sido realizada exitosamente.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        this.mostrarFormularioDonacion = false;
        this.donacionForm.reset();
        this.router.navigate(['/metas']);
      });
    }
    
  registerSaldo() {
    if (this.SaldoForm.invalid) {
      this.SaldoForm.markAllAsTouched();
      Swal.fire({
        title: 'Error',
        text: 'No se pudo recargar el saldo. Por favor, revise los campos o la conexión.',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }
    console.log('Recargando saldo...', this.SaldoForm.value);

    Swal.fire({
      title: 'Saldo recargado',
      text: 'El saldo ha sido recargado exitosamente.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      this.mostrarFormularioSaldo = false;
      this.SaldoForm.reset();
      this.router.navigate(['/metas']);
    });
  }

  formatVencimiento(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); 
  
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4); 
    }
  
    input.value = value;
  }
  validateNumericInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
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

  obtenerMensajesErrorDonacion(controlName: string) {
    const control = this.donacionForm.get(controlName);
    const mensajes: any[] = [];
    if (control?.errors && control?.touched) {
      Object.keys(control.errors).forEach(keyError => {
        switch (keyError) {
          case 'required':
            mensajes.push('Este campo es requerido');
            break;
          case 'min':
            mensajes.push('El valor mínimo es 1');
            break;
        }
      });
    }
    return mensajes;
  }

  obtenerMensajesErrorSaldo(controlName: string) {
    const control = this.SaldoForm.get(controlName);
    const mensajes: any[] = [];
    if (control?.errors && control?.touched) {
      Object.keys(control.errors).forEach(keyError => {
        switch (keyError) {
          case 'required':
            mensajes.push('Este campo es requerido');
            break;
          case 'min':
            mensajes.push('El valor mínimo es 1');
            break;
          case 'pattern':
            mensajes.push('El formato no es correcto');
            break;
        }
      });
    }
    return mensajes;
  }
  
}