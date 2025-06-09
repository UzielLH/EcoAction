import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MonederoService } from '../../services/monedero.service';
import { MetasService } from '../../services/metas.service';
import { map } from 'rxjs';
import imageCompression from 'browser-image-compression';
import { TransaccionService } from '../../services/Transaccion.service';

interface Meta {
  id: number;
  nombreMeta: string;
  dineroNecesario: number;
  dineroRecaudado: number;
  descripcionMeta: string;
  imagen: string;
  statusMeta: string; 
}
@Component({
  selector: 'app-metas',
  imports: [ CommonModule, ReactiveFormsModule],
  templateUrl: './metas.component.html',
  styles: ``
})
export class MetasComponent implements OnInit {
  metas: Meta[] = [];
  metaSeleccionada!: Meta;
  saldoPersona=0;
  userRole = localStorage.getItem('rol') ; // Obtener el rol del localStorage o asignar 'user' por defecto	
  mostrarFormulario = false;
  mostrarFormularioDonacion = false;
  mostrarFormularioSaldo = false;
  private router = inject(Router); // Definir router correctamente
  private monederoService = inject(MonederoService);
  private metasService = inject(MetasService); // Cambia esto por el servicio correcto
  private transaccionService = inject(TransaccionService);
  private fb=inject(FormBuilder);
  metaForm!: FormGroup;
  donacionForm!: FormGroup;
  SaldoForm!: FormGroup;

  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null; // Add this property

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    if (this.mostrarFormularioSaldo) {
      this.mostrarFormularioSaldo = false;
    }
    if (this.mostrarFormularioDonacion) {
      this.mostrarFormularioDonacion = false;
    }
    if (this.mostrarFormulario) {
      this.mostrarFormulario = false;
      this.metaForm.reset();
      this.selectedFile = null;
      this.imagePreviewUrl = null; // Reset the preview URL
    }
  }

  constructor(){
    this.metaForm = this.fb.group({
      nombreMeta: ['', [Validators.required, Validators.minLength(5)]],
      dineroNecesario: ['', [Validators.required, Validators.min(1)]],
      descripcionMeta: ['', [Validators.required, Validators.minLength(15)]],
      imagen: [null, [Validators.required]]
    });
    this.donacionForm=this.fb.group({
      donacion: ['', [Validators.required, Validators.min(1)]]
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

  const donacion = this.donacionForm.value.donacion;
  const metaId = this.metaSeleccionada.id.toString(); // Convertir a string si es necesario
  const uuid = localStorage.getItem('userUuid');

  if (!uuid) {
    Swal.fire({
      title: 'Error',
      text: 'No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.',
      icon: 'error',
      timer: 2000,
      showConfirmButton: false
    });
    return;
  }

  // Validar si el saldo es suficiente
  if (donacion > this.saldoPersona) {
    Swal.fire({
      title: 'Saldo insuficiente',
      text: 'No tienes saldo suficiente para realizar esta donación.',
      icon: 'error',
      confirmButtonColor: '#d33',
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  // Validar si la donación no excede la cantidad necesaria
  const restante = this.metaSeleccionada.dineroNecesario - this.metaSeleccionada.dineroRecaudado;
  if (donacion > restante) {
    Swal.fire({
      title: 'Donación excedida',
      text: `La donación excede la cantidad necesaria para esta meta. Solo se necesitan ${restante} monedas.`,
      icon: 'warning',
      confirmButtonColor: '#d33',
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  console.log('Donando...', { metaId, donacion, uuid });

  // Usar el TransaccionService para realizar la donación
  this.transaccionService.RealizarDonacion(uuid, donacion, metaId).subscribe({
    next: () => {
      // Actualizar el saldo local después de la donación exitosa
      this.saldoPersona -= donacion;
      
      Swal.fire({
        title: 'Donación realizada',
        text: 'La donación ha sido realizada exitosamente.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        this.mostrarFormularioDonacion = false;
        this.donacionForm.reset();
        this.obtenerMetas(); // Actualizar las metas después de la donación
        this.obtenerSaldo(); // Actualizar el saldo actual
      });
    },
    error: (error) => {
      console.error('Error al realizar la donación:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo realizar la donación. Por favor, inténtalo más tarde.',
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Aceptar'
      });
    }
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

  const uuid = localStorage.getItem('userUuid');
  if (!uuid) {
    Swal.fire({
      title: 'Error',
      text: 'No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.',
      icon: 'error',
      timer: 2000,
      showConfirmButton: false
    });
    return;
  }

  const monto = this.SaldoForm.value.saldo;
  const nombreTarjeta = this.SaldoForm.value.nombreTarjeta;
  const numeroTarjeta = this.SaldoForm.value.notarjeta;

  console.log('Recargando saldo...', { uuid, monto, nombreTarjeta, numeroTarjeta });

  // Usar el TransaccionService para realizar la recarga
  this.transaccionService.crearRecarga(uuid, monto, nombreTarjeta, numeroTarjeta).subscribe({
    next: () => {
      Swal.fire({
        title: 'Saldo recargado',
        text: 'El saldo ha sido recargado exitosamente.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        this.mostrarFormularioSaldo = false;
        this.SaldoForm.reset();
        this.obtenerSaldo(); // Actualizar el saldo actual
      });
    },
    error: (error) => {
      console.error('Error al realizar la recarga:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo realizar la recarga. Por favor, inténtalo más tarde.',
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Aceptar'
      });
    }
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
    if (this.userRole === 'user-realm-rol') {
    this.obtenerSaldo();
    }
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
    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
    
    // Existing compression logic
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
      id: item.id,
      nombreMeta: item.nombreMeta,
      dineroNecesario: item.dineroNecesario,
      dineroRecaudado: item.dineroRecaudado,
      descripcionMeta: item.descripcionMeta,
      imagen: item.imagen,
      statusMeta: item.statusMeta // Asegúrate de que este campo exista en tu API
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

abrirFormularioDonacion(meta: Meta) {
  this.metaSeleccionada = meta;
  this.mostrarFormularioDonacion = true;
}
}