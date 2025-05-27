import { Component, OnInit, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UsuarioPerfilService } from '../../services/UsuarioPerfil.service';
import Swal from 'sweetalert2';

import mapboxgl, { Map, NavigationControl, Marker, Popup } from 'mapbox-gl';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9uYWRlYyIsImEiOiJjbTlidmtyMTcwa2pzMmxvYmE4eTV3ZDJ6In0.wzhUjkQwPybXHGn_Ur_ECg';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styles: `
    :host {
      display: block;
    }
    
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .profile-header {
      display: flex;
      align-items: center;
      margin-bottom: 30px;
    }
    
    .profile-image {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #38a169;
      margin-right: 20px;
    }
    
    .image-placeholder {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background-color: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      color: #a0aec0;
      margin-right: 20px;
    }
    
    .profile-info {
      flex: 1;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    
    .info-item {
      margin-bottom: 15px;
    }
    
    .info-label {
      font-weight: 600;
      color: #4a5568;
      margin-bottom: 5px;
      display: block;
    }
    
    .info-value {
      padding: 8px 12px;
      background-color: #f7fafc;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }
    
    .location-map {
      height: 300px;
      width: 100%;
      margin-top: 20px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }
    
    /* Estilos para el marcador personalizado */
    .marker {
      width: 30px;
      height: 30px;
      background-image: url('https://docs.mapbox.com/mapbox-gl-js/assets/pin.png');
      background-size: cover;
      cursor: pointer;
    }
    
    /* Estilos para el popup de Mapbox */
    :host ::ng-deep .mapboxgl-popup {
      max-width: 250px;
    }
    
    :host ::ng-deep .mapboxgl-popup-content {
      padding: 12px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .edit-form {
      margin-top: 20px;
      padding: 20px;
      background-color: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    .form-label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
      color: #4a5568;
    }
    
    .form-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background-color: white;
    }
    
    .form-input.ng-invalid.ng-touched {
      border-color: #e53e3e;
    }
    
    .form-error {
      color: #e53e3e;
      font-size: 0.8rem;
      margin-top: 4px;
    }
    
    .btn-group {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
    
    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .btn-primary {
      background-color: #38a169;
      color: white;
      border: none;
    }
    
    .btn-primary:hover {
      background-color: #2f855a;
    }
    
    .btn-secondary {
      background-color: #718096;
      color: white;
      border: none;
    }
    
    .btn-secondary:hover {
      background-color: #4a5568;
    }
    
    .btn-outline {
      background-color: transparent;
      border: 1px solid #cbd5e0;
      color: #4a5568;
    }
    
    .btn-outline:hover {
      background-color: #f7fafc;
    }
    
    .edit-button {
      margin-left: 10px;
      padding: 4px 8px;
      background-color: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      color: #4a5568;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .edit-button:hover {
      background-color: #edf2f7;
      color: #2d3748;
    }
  `
})
export class PerfilComponent implements OnInit, AfterViewInit, OnDestroy {
  private usuarioService = inject(UsuarioPerfilService);
  private fb = inject(FormBuilder);
  
  usuarioData: any = null;
  empresaData: any = null;
  isLoading = true;
  isEmpresa = false;
  userUuid = '';
  rol = '';
  imagen: string | null = null;

  // Estado de edición
  isEditingUsuario = false;
  isEditingEmpresa = false;
  
  // Formularios
  usuarioForm!: FormGroup;
  empresaForm!: FormGroup;
  
  // Propiedad para el mapa
  private map: mapboxgl.Map | null = null;
  
  ngOnInit(): void {
    this.loadUserData();
    this.initForms();
  }
  
  ngAfterViewInit(): void {
    // El mapa se inicializará después de cargar los datos
  }
  
  ngOnDestroy(): void {
    // Limpiar recursos del mapa al destruir el componente
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
  
  // Inicializar formularios vacíos
  initForms(): void {
    this.usuarioForm = this.fb.group({
      id: [''],
      nombre: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      fechaNacimiento: ['']
    });
    
    this.empresaForm = this.fb.group({
      id: [''],
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      telefono: [''],
      direccion: [''],
      horario: [''],
      latitud: [null, [Validators.min(-90), Validators.max(90)]],
      longitud: [null, [Validators.min(-180), Validators.max(180)]]
    });
  }
  
  loadUserData(): void {
    this.userUuid = localStorage.getItem('userUuid') || '';
    this.rol = localStorage.getItem('rol') || '';
    
    console.log('UUID:', this.userUuid);
    console.log('Rol desde localStorage:', this.rol);
    
    // Verificar el rol de manera más robusta
    this.isEmpresa = Boolean(this.rol && (
      this.rol.toLowerCase() === 'empresa' || 
      this.rol.toLowerCase().includes('empresa') ||
      this.rol.toLowerCase() === 'company'
    ));
    
    console.log('¿Es empresa?:', this.isEmpresa);
    
    if (this.userUuid) {
      if (this.isEmpresa) {
        console.log('Intentando cargar datos de empresa...');
        this.fetchEmpresaData();
      } else {
        console.log('Intentando cargar datos de usuario...');
        this.fetchUsuarioData();
      }
    } else {
      console.error('No se encontró userUuid en localStorage');
      this.isLoading = false;
      Swal.fire({
        icon: 'warning',
        title: 'Sesión no encontrada',
        text: 'Por favor, inicie sesión nuevamente.',
      });
    }
  }

  fetchUsuarioData(): void {
    console.log('Ejecutando fetchUsuarioData para UUID:', this.userUuid);
    this.usuarioService.getUsuarioByUuid(this.userUuid)
      .subscribe({
        next: (data: any) => {
          console.log('Datos de usuario recibidos:', data);
          this.usuarioData = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al obtener datos del usuario:', error);
          this.isLoading = false;
          
          // Si falla como usuario, intentar como empresa
          console.log('Fallback: intentando cargar como empresa...');
          this.isEmpresa = true;
          this.fetchEmpresaData();
        }
      });
  }

  fetchEmpresaData(): void {
    console.log('Ejecutando fetchEmpresaData para UUID:', this.userUuid);
    this.usuarioService.getEmpresaByUuid(this.userUuid)
      .subscribe({
        next: (data: any) => {
          console.log('Datos de empresa recibidos:', data);
          this.empresaData = data;
          this.isEmpresa = true; // Asegurar que se marque como empresa
          this.isLoading = false;
          
          // Check for company image only if the data includes image info
          this.checkEmpresaImage();
          
          // Inicializar el mapa después de cargar los datos
          if (this.empresaData?.latitud && this.empresaData?.longitud) {
            // Pequeño retraso para asegurar que el DOM esté listo
            setTimeout(() => this.initMap(), 100);
          }
        },
        error: (error) => {
          console.error('Error al obtener datos de la empresa:', error);
          this.isLoading = false;
          
          // Si también falla como empresa y no habíamos intentado usuario
          if (this.isEmpresa && !this.usuarioData) {
            console.log('Fallback: intentando cargar como usuario...');
            this.isEmpresa = false;
            this.fetchUsuarioData();
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudieron cargar los datos del perfil. Por favor, intente más tarde.',
            });
          }
        }
      });
  }

  checkEmpresaImage(): void {
    // Verificar si la empresa tiene imagen en los datos recibidos
    if (this.empresaData) {
      console.log('Verificando imagen de empresa:', this.empresaData);
      
      // La empresa tiene una URL de imagen
      if (this.empresaData.imagen && this.empresaData.imagen.trim() !== '') {
        console.log('URL de imagen encontrada:', this.empresaData.imagen);
        
        // Utilizar el método processImageData del servicio para procesar la URL
        this.imagen = this.usuarioService.processImageData(this.empresaData.imagen);
        
        if (this.imagen) {
          console.log('Imagen procesada correctamente:', this.imagen);
        } else {
          console.log('No se pudo procesar la URL de la imagen');
          
          // Intentar con id si está disponible
          if (this.empresaData.id) {
            this.imagen = this.usuarioService.getEmpresaImageUrl(this.empresaData.id);
            console.log('Usando URL basada en ID:', this.imagen);
          }
        }
      } else {
        console.log('No se encontró URL de imagen para la empresa');
        this.imagen = null;
      }
    }
  }
  
  // Método para inicializar el mapa
  initMap(): void {
    if (!this.empresaData?.latitud || !this.empresaData.longitud) {
      console.error('Coordenadas no disponibles para inicializar el mapa');
      return;
    }

    console.log("Inicializando mapa con coordenadas:", this.empresaData.latitud, this.empresaData.longitud);

    try {
      // Fix: Cast mapboxgl to any to bypass TypeScript restriction
      (mapboxgl as any).accessToken = MAPBOX_TOKEN;

      this.map = new mapboxgl.Map({
        container: "map",
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [this.empresaData.longitud, this.empresaData.latitud],
        zoom: 15,
        attributionControl: true
      });
      
      // Rest of your code remains the same...
      this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <h4 style="font-weight: bold; color: #2C7A51;">${this.empresaData.nombre}</h4>
          <p>${this.empresaData.direccion || 'Sin dirección registrada'}</p>
          ${this.empresaData.horario ? `<p>⏰ ${this.empresaData.horario}</p>` : ''}
          ${this.empresaData.telefono ? `<p>📞 ${this.empresaData.telefono}</p>` : ''}
        `);
      
      new mapboxgl.Marker({ color: '#2C7A51' })
        .setLngLat([this.empresaData.longitud, this.empresaData.latitud])
        .setPopup(popup)
        .addTo(this.map);
      
      popup.addTo(this.map);
      
    } catch (error) {
      console.error('Error al inicializar el mapa:', error);
    }
  }

  // Helper para formatear la fecha
  formatDate(dateString: string): string {
    if (!dateString) return 'No disponible';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Método auxiliar para mostrar coordenadas formateadas
  formatCoordinates(lat?: number, lng?: number): string {
    if (lat === undefined || lng === undefined) return 'No disponible';
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }

  // Método para debugging - puedes llamarlo desde el template
  debugInfo(): void {
    console.log('=== DEBUG INFO ===');
    console.log('userUuid:', this.userUuid);
    console.log('rol:', this.rol);
    console.log('isEmpresa:', this.isEmpresa);
    console.log('usuarioData:', this.usuarioData);
    console.log('empresaData:', this.empresaData);
    console.log('isLoading:', this.isLoading);
    console.log('==================');
  }
  
  // NUEVOS MÉTODOS PARA EDICIÓN
  
  // Iniciar edición de usuario
  startEditUsuario(): void {
    this.usuarioForm.patchValue({
      id: this.usuarioData.id,
      nombre: this.usuarioData.nombre || '',
      apellidos: this.usuarioData.apellidos || '',
      email: this.usuarioData.email || '',
      username: this.usuarioData.username || '',
      fechaNacimiento: this.formatDateForInput(this.usuarioData.fechaNacimiento)
    });
    
    this.isEditingUsuario = true;
  }
  
  // Iniciar edición de empresa
  startEditEmpresa(): void {
    this.empresaForm.patchValue({
      id: this.empresaData.id,
      nombre: this.empresaData.nombre || '',
      email: this.empresaData.email || '',
      username: this.empresaData.username || '',
      telefono: this.empresaData.telefono || '',
      direccion: this.empresaData.direccion || '',
      horario: this.empresaData.horario || '',
      latitud: this.empresaData.latitud || null,
      longitud: this.empresaData.longitud || null
    });
    
    this.isEditingEmpresa = true;
  }
  
  // Cancelar edición
  cancelEdit(): void {
    this.isEditingUsuario = false;
    this.isEditingEmpresa = false;
  }
  
  // MÉTODO CORREGIDO: Refrescar datos después de actualizar
  private refreshUserData(): void {
    console.log('Refrescando datos del perfil...');
    this.isLoading = true;
    
    if (this.isEmpresa) {
      this.fetchEmpresaData();
    } else {
      this.fetchUsuarioData();
    }
  }
  
  // Guardar cambios de usuario - CORREGIDO
  saveUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.markFormGroupTouched(this.usuarioForm);
      return;
    }
    
    const usuarioData = { ...this.usuarioForm.value };
    
    // Si no se ha modificado la fecha, usar la fecha original
    if (!usuarioData.fechaNacimiento && this.usuarioData.fechaNacimiento) {
      usuarioData.fechaNacimiento = this.usuarioData.fechaNacimiento;
    }
    
    // Agregar el UUID de Keycloak
    usuarioData.uuidKeycloak = this.userUuid;
    
    console.log('Datos a enviar (Usuario):', usuarioData);
    
    this.isLoading = true;
    this.usuarioService.updateUsuario(usuarioData)
      .subscribe({
        next: (response) => {
          console.log('Respuesta del servidor (Usuario):', response);
          this.isEditingUsuario = false;
          
          Swal.fire({
            icon: 'success',
            title: '¡Perfil actualizado!',
            text: 'Los datos de tu perfil se han actualizado correctamente.',
            timer: 2000,
            timerProgressBar: true
          });
          
          // CLAVE: Refrescar los datos después de la actualización
          this.refreshUserData();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al actualizar el usuario:', error);
          Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'No se pudo actualizar el perfil. Inténtalo de nuevo más tarde.',
          });
        }
      });
  }
  
  // Guardar cambios de empresa - CORREGIDO
  saveEmpresa(): void {
    if (this.empresaForm.invalid) {
      this.markFormGroupTouched(this.empresaForm);
      return;
    }
    
    const empresaData = {
      ...this.empresaForm.value,
      // Preservar datos que no están en el formulario
      imagen: this.empresaData.imagen || null,
      // Incluir el UUID de Keycloak que es crucial para la actualización
      uuidKeycloak: this.userUuid
    };

    console.log('Datos a enviar (Empresa):', empresaData);
    
    // Guardar coordenadas anteriores para comparar
    const oldLat = this.empresaData.latitud;
    const oldLng = this.empresaData.longitud;
    
    this.isLoading = true;
    this.usuarioService.updateEmpresa(empresaData)
      .subscribe({
        next: (response) => {
          console.log('Respuesta del servidor (Empresa):', response);
          this.isEditingEmpresa = false;
          
          Swal.fire({
            icon: 'success',
            title: '¡Perfil actualizado!',
            text: 'Los datos de tu empresa se han actualizado correctamente.',
            timer: 2000,
            timerProgressBar: true
          });
          
          // CLAVE: Refrescar los datos después de la actualización
          // También manejamos la actualización del mapa aquí
          this.refreshUserData();
          
          // Si cambiaron las coordenadas, reinicializar el mapa después de refrescar
          if (oldLat !== empresaData.latitud || oldLng !== empresaData.longitud) {
            setTimeout(() => {
              if (this.map) {
                this.map.remove();
                this.map = null;
              }
              if (this.empresaData?.latitud && this.empresaData?.longitud) {
                this.initMap();
              }
            }, 500); // Dar tiempo para que se actualicen los datos
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al actualizar la empresa:', error);
          Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'No se pudo actualizar el perfil. Inténtalo de nuevo más tarde.',
          });
        }
      });
  }
  
  // Utilidad para marcar todos los campos como "tocados"
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
  
  // Formatear fecha para input type="date"
  formatDateForInput(dateString?: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toISOString().substring(0, 10);
  }
  
  // Verificar si un campo es inválido para mostrar errores
  isFieldInvalid(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!control && control.invalid && control.touched;
  }
}