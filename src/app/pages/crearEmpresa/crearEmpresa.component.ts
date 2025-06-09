import { ChangeDetectionStrategy, Component, inject, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forbiddenName } from '../../validators/forbiddenName';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CreacionEmpresaService } from '../../services/CreacionEmpresa.service';
import Swal from 'sweetalert2';
import mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-crear-empresa',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './crearEmpresa.component.html',
  styles: `
    :host {
      display: block;
    }
    
    /* Estilos para el mapa y marcador */
    .map-container {
      position: relative;
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      margin-top: 0.75rem;
      margin-bottom: 1rem;
    }
    
    .map-loading {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.75);
      z-index: 10;
    }
    
    .map-loading-spinner {
      width: 2.5rem;
      height: 2.5rem;
      border: 4px solid #e2e8f0;
      border-top-color: #10b981;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    /* Estilo para vista previa de imagen */
    .image-preview {
      margin-top: 1rem;
      border-radius: 0.375rem;
      overflow: hidden;
      max-width: 100%;
      max-height: 12rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }
    
    .image-preview img {
      width: 100%;
      height: auto;
      object-fit: cover;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearEmpresaComponent implements OnInit, OnDestroy { 
  // Referencia para el campo de dirección para manejar el evento Enter
  @ViewChild('direccionInput') direccionInput!: ElementRef;

  private mapa!: mapboxgl.Map;
  private marker!: mapboxgl.Marker;
  private fb = inject(FormBuilder);
  private creacionEmpresaService = inject(CreacionEmpresaService);
  registerEmpresa!: FormGroup;
  // Añade estas propiedades a tu clase de componente
  isDragging = false;
  selectedFile: File | null = null;
  // Variables para mejorar la experiencia de usuario
  mapaInicializado = false;
  cargandoDireccion = false;
  imagenPreview: string | null = null;
  showPassword = false;
  keyboardListener: any;
  
  constructor() {
    this.registerEmpresa = this.fb.group({
      nombre: ['',  [Validators.required, Validators.minLength(5)]],
      username: ['', [Validators.required, Validators.minLength(5), forbiddenName()]],
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
      direccion: ['', [Validators.required, Validators.minLength(15)]],
      fechaNacimiento: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9+]{10,15}$')]],
      horario: ['', [Validators.required, Validators.minLength(5)]],
      latitud: ['', [Validators.required]],
      longitud: ['', [Validators.required]],
      file: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }
  
  ngOnInit() {
    setTimeout(() => {
      this.initializeMapa();
    }, 500);
    
    // Agregar listener global para Enter en campos de dirección
    this.keyboardListener = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && 
          document.activeElement === this.direccionInput?.nativeElement) {
        event.preventDefault();
        this.buscarDireccion();
      }
    };
    
    document.addEventListener('keydown', this.keyboardListener);
  }
  
  ngOnDestroy() {
    // Limpiar listener al destruir componente
    if (this.keyboardListener) {
      document.removeEventListener('keydown', this.keyboardListener);
    }
  }

  // Método para manejar el evento dragover
onDragOver(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
  this.isDragging = true;
}

// Método para manejar el evento dragleave
onDragLeave(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
  this.isDragging = false;
}

// Método para manejar el evento drop
onDrop(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
  this.isDragging = false;
  
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    this.handleFile(files[0]);
  }
}

// Método para manejar la subida de archivos desde el input o el drop
// onFileChange(event: Event): void {
//   const fileInput = event.target as HTMLInputElement;
//   if (fileInput.files && fileInput.files[0]) {
//     this.handleFile(fileInput.files[0]);
//   }
// }

// Método común para procesar el archivo
handleFile(file: File): void {
  // Validar tipo de archivo
  if (!file.type.match('image/*')) {
    Swal.fire({
      icon: 'error',
      title: 'Formato no válido',
      text: 'El archivo debe ser una imagen (JPG, PNG, etc.)',
      confirmButtonColor: '#d33'
    });
    return;
  }
  
  // Validar tamaño (5MB máximo)
  if (file.size > 5 * 1024 * 1024) {
    Swal.fire({
      icon: 'error',
      title: 'Imagen demasiado grande',
      text: 'El archivo no debe superar los 5MB',
      confirmButtonColor: '#d33'
    });
    return;
  }
  
  // Guardar el archivo seleccionado
  this.selectedFile = file;
  
  // Actualizar control de formulario
  this.registerEmpresa.patchValue({
    file: file.name
  });
  this.registerEmpresa.markAsDirty();
  
  // Crear vista previa usando ChangeDetectorRef para actualización inmediata
  const reader = new FileReader();
  reader.onload = () => {
    // Usar setTimeout para asegurar que Angular detecte el cambio
    setTimeout(() => {
      this.imagenPreview = reader.result as string;
    }, 0);
  };
  reader.readAsDataURL(file);
}

// Método para eliminar la imagen seleccionada
removeImage(): void {
  this.imagenPreview = null;
  this.selectedFile = null;
  this.registerEmpresa.patchValue({
    file: ''
  });
  
  // Reset el input file
  const fileInput = document.getElementById('file-upload') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
}
  
  validarEntradaTelefono(event: KeyboardEvent) {
    const tecla = event.key;
    const permitidos = /^[0-9+]$/; // Solo números y el símbolo +
    if (!permitidos.test(tecla)) {
      event.preventDefault(); // Bloquea la entrada si no es válida
    }
  }

  private initializeMapa() {
    // Mostrar indicador de carga
    this.mapaInicializado = false;
    
    this.mapa = new mapboxgl.Map({
      container: 'mapa',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-96.7210, 17.019], // Centro inicial (ajusta según tu ubicación)
      zoom: 12
    });
    
    // Agregar controles de navegación
    this.mapa.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Cuando el mapa esté cargado
    this.mapa.on('load', () => {
      this.mapaInicializado = true;
      
      // Crear marcador arrastrable con color personalizado
      this.marker = new mapboxgl.Marker({
        draggable: true,
        color: '#10b981' // Color verde que combina con el tema
      })
      .setLngLat([-96.7210, 17.019])
      .addTo(this.mapa);

      // Actualizar coordenadas y dirección cuando se arrastra el marcador
      this.marker.on('dragend', () => {
        const lngLat = this.marker.getLngLat();
        
        // Actualizar coordenadas en el formulario
        this.registerEmpresa.patchValue({
          latitud: lngLat.lat.toFixed(7),
          longitud: lngLat.lng.toFixed(7)
        });
        
        // Obtener la dirección basada en las nuevas coordenadas
        this.obtenerDireccionDesdeCoords(lngLat.lng, lngLat.lat);
      });
    });
  }
  
  // Método para obtener dirección desde coordenadas (geocodificación inversa)
  async obtenerDireccionDesdeCoords(lng: number, lat: number) {
    this.cargandoDireccion = true;
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&types=address`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const direccion = data.features[0].place_name;
        
        // Actualizar el campo de dirección en el formulario
        this.registerEmpresa.patchValue({
          direccion: direccion
        });
      }
    } catch (error) {
      console.error('Error al obtener la dirección:', error);
    } finally {
      this.cargandoDireccion = false;
    }
  }

  async buscarDireccion() {
    const direccion = this.registerEmpresa.get('direccion')?.value;
    if (!direccion) return;
    
    this.cargandoDireccion = true;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(direccion)}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        
        // Mostrar notificación de éxito
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Ubicación encontrada',
          showConfirmButton: false,
          timer: 1500,
          toast: true
        });
        
        // Actualizar mapa y marcador con animación
        this.mapa.flyTo({
          center: [lng, lat],
          zoom: 15,
          essential: true,
          duration: 1000
        });
        this.marker.setLngLat([lng, lat]);

        // Actualizar formulario
        this.registerEmpresa.patchValue({
          latitud: lat.toFixed(7),
          longitud: lng.toFixed(7),
          // Actualizar dirección con descripción completa de Mapbox
          direccion: data.features[0].place_name
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Dirección no encontrada',
          text: 'No se encontraron resultados para esta dirección. Intenta con una descripción más específica.',
          confirmButtonColor: '#10b981'
        });
      }
    } catch (error) {
      console.error('Error al buscar dirección:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un problema al buscar la dirección. Inténtalo de nuevo más tarde.',
        confirmButtonColor: '#d33'
      });
    } finally {
      this.cargandoDireccion = false;
    }
  }
  
  // Método para manejar la selección de archivo de imagen
  onFileChange(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      
      // Validar tipo de archivo
      if (!file.type.match('image/*')) {
        Swal.fire({
          icon: 'error',
          title: 'Formato no válido',
          text: 'El archivo debe ser una imagen (JPG, PNG, etc.)',
          confirmButtonColor: '#d33'
        });
        return;
      }
      
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'Imagen demasiado grande',
          text: 'El archivo no debe superar los 5MB',
          confirmButtonColor: '#d33'
        });
        return;
      }
      
      // Actualizar control de formulario
      this.registerEmpresa.patchValue({
        file: file.name
      });
      
      // Crear vista previa
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
  
  // Método para alternar visibilidad de contraseña
  togglePasswordVisibility(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.showPassword = !this.showPassword;
    
    const passwordField = document.querySelector('[formControlName="password"]') as HTMLInputElement;
    if (passwordField) {
      passwordField.type = this.showPassword ? 'text' : 'password';
    }
  }
  
  async registroEmpresa() {
    if (this.registerEmpresa.invalid) {
      this.registerEmpresa.markAllAsTouched();
      
      // Mostrar mensaje más descriptivo sobre los campos faltantes
      const camposFaltantes = Object.keys(this.registerEmpresa.controls)
        .filter(key => this.registerEmpresa.get(key)?.invalid)
        .map(key => this.obtenerEtiquetaCampo(key));
      
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        html: `Por favor, completa correctamente los siguientes campos:<br><br>
              <ul style="text-align: left; display: inline-block;">
                ${camposFaltantes.map(campo => `<li>• ${campo}</li>`).join('')}
              </ul>`,
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const empresaData = this.registerEmpresa.value;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const imageFile = fileInput?.files?.[0];

    if (!imageFile) {
      Swal.fire({
        icon: 'error',
        title: 'Imagen requerida',
        text: 'Por favor selecciona una imagen para la empresa',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    // Mostrar indicador de carga durante el registro
    Swal.fire({
      title: 'Registrando empresa',
      text: 'Esto puede tomar unos momentos...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await this.creacionEmpresaService.crearEmpresa(empresaData);
      const empresaId = response?.id;

      if (!empresaId) {
        throw new Error('No se pudo obtener el ID de la empresa creada');
      }

      await this.creacionEmpresaService.subirImagen(empresaId, this.selectedFile!).toPromise();

      Swal.fire({
        icon: 'success',
        title: '¡Registro exitoso!',
        text: 'La empresa ha sido creada y la imagen ha sido subida exitosamente.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error: any) {
      const errorMessage = error?.message || 'Ocurrió un error al crear la empresa. Por favor, inténtalo de nuevo.';
      Swal.fire({
        icon: 'error',
        title: 'Error en el registro',
        text: errorMessage,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Aceptar'
      });
      console.error('Error en el proceso de registro:', error);
    }
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
            mensajes.push('Excedió el máximo de caracteres');
            break;
          case 'minlength':
            mensajes.push('El campo necesita el mínimo de caracteres');
            break;
          case 'forbiden':
            mensajes.push('Ese usuario no está disponible');
            break;
          case 'pattern':
            mensajes.push('El formato no es correcto');
            break;
          case 'forbiddenName':
            mensajes.push('Ese usuario no está disponible');
            break;
        }
      });
    }
    return mensajes;
  }
  
  // Método auxiliar para obtener etiquetas de los campos para mensajes de error
  obtenerEtiquetaCampo(controlName: string): string {
    const etiquetas: {[key: string]: string} = {
      'nombre': 'Nombre de la empresa',
      'username': 'Nombre de usuario',
      'email': 'Correo electrónico',
      'direccion': 'Dirección',
      'fechaNacimiento': 'Fecha de creación',
      'telefono': 'Teléfono',
      'horario': 'Horario',
      'latitud': 'Ubicación en el mapa',
      'longitud': 'Ubicación en el mapa',
      'file': 'Imagen de la empresa',
      'password': 'Contraseña'
    };
    
    return etiquetas[controlName] || controlName;
  }

  getInvalidControls(): string[] {
  return Object.keys(this.registerEmpresa.controls)
    .filter(controlName => {
      const control = this.registerEmpresa.get(controlName);
      return control?.invalid && (control?.touched || control?.dirty);
    });
  }
}