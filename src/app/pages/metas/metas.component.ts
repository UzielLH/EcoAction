import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MonederoService } from '../../services/monedero.service';
import { MetasService } from '../../services/metas.service';
import { map } from 'rxjs';
import imageCompression from 'browser-image-compression';

interface Meta {
  nombreMeta: string;
  dineroNecesario: number;
  dineroRecaudado: number;
  descripcionMeta: string;
  imagen: string;
}
@Component({
  selector: 'app-metas',
  imports: [ CommonModule, ReactiveFormsModule],
  templateUrl: './metas.component.html',
  styles: ``
})
export class MetasComponent implements OnInit {
  metas: Meta[] = [];
  saldoPersona=0;
  userRole = localStorage.getItem('rol') ; // Obtener el rol del localStorage o asignar 'user' por defecto	
  mostrarFormulario = false;
  mostrarFormularioDonacion = false;
  mostrarFormularioSaldo = false;
  private router = inject(Router); // Definir router correctamente
  private monederoService = inject(MonederoService);
  private metasService = inject(MetasService); // Cambia esto por el servicio correcto


  // metas: Meta[] = [
  //   {
  //     nombreMeta: "Limpiar Zócalo",
  //     cantidadMonedas: 120,
  //     cantidadTotal: 500,
  //     descripcion: "Meta para limpiar el Zócalo de la ciudad.",
  //     linkImagen: "https://www.ciudadespatrimonio.mx/wp-content/uploads/2018/04/zocalo-oaxaca.jpg"
  //   },
  //   {
  //     nombreMeta: "Reforestar Parque",
  //     cantidadMonedas: 300,
  //     cantidadTotal: 1000,
  //     descripcion: "Reforestación con árboles nativos en el parque central.",
  //     linkImagen: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/b2/2f/b8/estatua-y-homenaje-principal.jpg?w=1200&h=-1&s=1"
  //   },
  //   {
  //     nombreMeta: "Alimentar Perritos Callejeros",
  //     cantidadMonedas: 80,
  //     cantidadTotal: 200,
  //     descripcion: "Compra de alimento para perritos en situación de calle.",
  //     linkImagen: "https://www.muyinteresante.com/wp-content/uploads/sites/5/2024/06/04/665f0461a9ae0.jpeg"
  //   },
  //   {
  //     nombreMeta: "Alimentar Perritos Callejeros",
  //     cantidadMonedas: 80,
  //     cantidadTotal: 200,
  //     descripcion: "Compra de alimento para perritos en situación de calle.",
  //     linkImagen: "https://www.muyinteresante.com/wp-content/uploads/sites/5/2024/06/04/665f0461a9ae0.jpeg"
  //   }
  // ];
  


  private fb=inject(FormBuilder);
  metaForm!: FormGroup;
  donacionForm!: FormGroup;
  SaldoForm!: FormGroup;

  selectedFile: File | null = null;

  constructor(){
    this.metaForm = this.fb.group({
      nombreMeta: ['', [Validators.required, Validators.minLength(5)]],
      dineroNecesario: ['', [Validators.required, Validators.min(1)]],
      descripcionMeta: ['', [Validators.required, Validators.minLength(15)]],
      imagen: [null, [Validators.required]]
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
  if (this.metaForm.invalid || !this.selectedFile) {
    this.metaForm.markAllAsTouched();
    Swal.fire({
      title: 'Error',
      text: 'Por favor completa todos los campos, incluida la imagen.',
      icon: 'error',
      timer: 2000,
      showConfirmButton: false
    });
    return;
  }

  const metaData = {
    nombreMeta: this.metaForm.value.nombreMeta,
    dineroNecesario: this.metaForm.value.dineroNecesario,
    descripcionMeta: this.metaForm.value.descripcionMeta
  };

  // Paso 1: Crear la meta
  this.metasService.crearMeta(metaData).subscribe({
    next: (response: any) => {
      const metaId = response.id; // <- asegúrate de que el backend devuelva este id
      
      // Paso 2: Subir imagen
      this.metasService.uploadImage(metaId, this.selectedFile!).subscribe({
        next: () => {
          Swal.fire({
            title: 'Meta creada',
            text: 'La meta ha sido creada exitosamente.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            this.mostrarFormulario = false;
            this.metaForm.reset();
            this.selectedFile = null;
            window.location.reload();

            this.router.navigate(['/metas']);
          });
        },
        error: () => {
          Swal.fire('Error', 'No se pudo subir la imagen.', 'error');
        }
      });
    },
    error: () => {
      Swal.fire('Error', 'No se pudo crear la meta.', 'error');
    }
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
  

    ngOnInit(): void {
    this.obtenerSaldo(); // Llamar al método para recuperar el saldo al inicializar el componente
    this.obtenerMetas();
  }

  obtenerSaldo(): void {
    const uuid = localStorage.getItem('userUuid'); // Obtener el UUID del usuario desde el localStorage
    if (!uuid) {
      console.error('No se encontró el UUID del usuario.');
      return;
    }

    this.monederoService.buscarMonederoPorId(uuid).subscribe({
      next: (response: any) => {
        this.saldoPersona = response.saldo || 0; // Asignar el saldo recuperado
      },
      error: (error) => {
        console.error('Error al recuperar el saldo:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo recuperar el saldo. Por favor, inténtalo más tarde.',
          icon: 'error',
          confirmButtonColor: '#d33',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

//   onFileSelected(event: any): void {
//   const file = event.target.files[0];
//   if (file) {
//     this.selectedFile = file;
//     this.metaForm.patchValue({ imagen: file });
//   }
// }

onFileSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      const options = {
        maxSizeMB: 10,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      imageCompression(file, options)
        .then((compressedFile) => {
          console.log('Archivo comprimido:', compressedFile);
          this.selectedFile = compressedFile;
          this.metaForm.patchValue({ imagen: compressedFile });
        })
        .catch((error) => {
          console.error('Error al comprimir la imagen:', error);
          Swal.fire('Error', 'No se pudo comprimir la imagen.', 'error');
        });
    } else {
      this.selectedFile = file;
      this.metaForm.patchValue({ imagen: file });
    }
  }
}




obtenerMetas(): void {
  this.metasService.mostrarMetas().pipe(
    map((data: any[]) => data.map(item => ({
      nombreMeta: item.nombreMeta,
      dineroNecesario: item.dineroNecesario,
      dineroRecaudado: item.dineroRecaudado,
      descripcionMeta: item.descripcionMeta,
      imagen: item.imagen
    })))
  ).subscribe({
    next: (data: Meta[]) => {
      this.metas = data;
    },
    error: (err) => {
      console.error('Error al obtener las metas', err);
      Swal.fire('Error', 'No se pudieron cargar las metas.', 'error');
    }
  });
}

}