import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearEmpresaComponent { 
  private mapa!: mapboxgl.Map;
  private marker!: mapboxgl.Marker;
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
      latitud:['', [Validators.required]],
      longitud:['', [Validators.required]],
      file:['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }
  
  ngOnInit() {
    this.initializeMapa();
  }
  validarEntradaTelefono(event: KeyboardEvent) {
    const tecla = event.key;
    const permitidos = /^[0-9+]$/; // Solo números y el símbolo +
    if (!permitidos.test(tecla)) {
      event.preventDefault(); // Bloquea la entrada si no es válida
    }
  }

  private initializeMapa() {
    this.mapa = new mapboxgl.Map({
      container: 'mapa',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-96.7434342, 17.0588186], // Centro inicial (ajusta según tu ubicación)
      zoom: 12
    });

    // Crear marcador arrastrable
    this.marker = new mapboxgl.Marker({
      draggable: true
    })
    .setLngLat([-96.7434342, 17.0588186])
    .addTo(this.mapa);

    // Actualizar coordenadas cuando se arrastra el marcador
    this.marker.on('dragend', () => {
      const lngLat = this.marker.getLngLat();
      this.registerEmpresa.patchValue({
        latitud: lngLat.lat.toFixed(7),
        longitud: lngLat.lng.toFixed(7)
      });
    });
  }

  async buscarDireccion() {
    const direccion = this.registerEmpresa.get('direccion')?.value;
    if (!direccion) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(direccion)}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        
        // Actualizar mapa y marcador
        this.mapa.flyTo({
          center: [lng, lat],
          zoom: 15
        });
        this.marker.setLngLat([lng, lat]);

        // Actualizar formulario
        this.registerEmpresa.patchValue({
          latitud: lat.toFixed(7),
          longitud: lng.toFixed(7)
        });
      }
    } catch (error) {
      console.error('Error al buscar dirección:', error);
    }
  }
  
  
async registroEmpresa() {
  if (this.registerEmpresa.invalid) {
    this.registerEmpresa.markAllAsTouched();
    return;
  }

  const empresaData = this.registerEmpresa.value;
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

  try {
    const response = await this.creacionEmpresaService.crearEmpresa(empresaData);
    const empresaId = response?.id;

    if (!empresaId) {
      throw new Error('No se pudo obtener el ID de la empresa creada');
    }

    await this.creacionEmpresaService.subirImagen(empresaId, imageFile).toPromise();

    Swal.fire({
      icon: 'success',
      title: '¡Éxito!',
      text: 'La empresa ha sido creada y la imagen ha sido subida exitosamente.',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error: any) {
    const errorMessage = error?.message || 'Ocurrió un error al crear la empresa. Por favor, inténtalo de nuevo.';
    Swal.fire({
      icon: 'error',
      title: 'Error',
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

