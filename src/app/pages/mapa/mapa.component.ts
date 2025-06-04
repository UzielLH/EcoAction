import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import mapboxgl from '../../utils/mapbox-token';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MapService } from '../../services/map.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { map } from 'rxjs/operators';

// Interfaz completa para la recicladora
interface Recicladora {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  horario: string;
  imagen: string;
  latitud: number | null;
  longitud: number | null;
}

@Component({
  selector: 'app-mapa',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mapa.component.html',
  styles: ``,
  encapsulation: ViewEncapsulation.None 
})
export class MapaComponent implements OnInit {
  mapa!: mapboxgl.Map;
  private fb = inject(FormBuilder);
  private mapService = inject(MapService);

  // Control de formulario para el buscador
  searchControl = new FormControl('');
  
  // Arrays para almacenar las recicladoras (todas y filtradas)
  recicladoras: Recicladora[] = [];
  recicladorasFiltradas: Recicladora[] = [];
  recicladoraSeleccionada: Recicladora | null = null;

  // Propiedades para manejo de rutas
  rutaActiva = false;
  userLocation: [number, number] | null = null;
  routeMarkers: mapboxgl.Marker[] = [];
  routeLayer: any = null;
  
  ngOnInit(): void {
    console.log('Inicializando mapa...');
    this.initMap();
    this.initSearch();
    this.obtenerRecicladoras();
  }

  // Inicializar el mapa
  initMap(): void {
    this.mapa = new mapboxgl.Map({
      container: 'mapa',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-96.7434342, 17.0588186],
      zoom: 12,
      attributionControl: false
    });

    this.mapa.addControl(new mapboxgl.AttributionControl({ compact: true }), 'top-right');
    
    // Añadir controles de navegación
    this.mapa.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Cargar mapa y esperar a que esté listo
    this.mapa.on('load', () => {
      console.log('Mapa cargado correctamente');
    });
  }

  // Configurar el buscador para filtrar recicladoras
  initSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.filtrarRecicladoras(searchTerm || '');
    });
  }

  // Filtrar las recicladoras según término de búsqueda
  filtrarRecicladoras(termino: string): void {
    if (!termino.trim()) {
      this.recicladorasFiltradas = [...this.recicladoras];
      return;
    }
    
    const terminoLowerCase = termino.toLowerCase();
    this.recicladorasFiltradas = this.recicladoras.filter(r => 
      r.nombre.toLowerCase().includes(terminoLowerCase) || 
      r.direccion.toLowerCase().includes(terminoLowerCase)
    );
  }

  // Obtener recicladoras del backend
  obtenerRecicladoras(): void {
    // Usar el operador map para convertir la respuesta al tipo correcto
    this.mapService.getRecicladoras().pipe(
      map((data: any) => data as Recicladora[])
    ).subscribe({
      next: (recicladoras: Recicladora[]) => {
        this.recicladoras = recicladoras;
        this.recicladorasFiltradas = [...recicladoras];
        this.crearMarcadores();
      },
      error: (error) => {
        console.error('Error al obtener recicladoras:', error);
      }
    });
  }

  // Crear marcadores para cada recicladora
  crearMarcadores(): void {
    this.recicladoras.forEach(r => {
      // Verificar que tanto latitud como longitud tengan valores válidos
      if (r.latitud !== null && r.longitud !== null) {
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
        markerElement.innerHTML = `
          <div class="marker-pin bg-green-800">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        `;

        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([r.longitud, r.latitud])
          .addTo(this.mapa);

        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
          .setHTML(`
            <div class="p-2">
              <p class="font-bold text-sm">${r.nombre}</p>
              <p class="text-xs text-gray-600">${r.direccion}</p>
            </div>
          `);

        marker.setPopup(popup);

        markerElement.addEventListener('click', () => {
          this.recicladoraSeleccionada = r;
          this.mapa.flyTo({
            center: [r.longitud!, r.latitud!],
            zoom: 15,
            essential: true
          });
          
          setTimeout(() => {
            const card = document.getElementById('card-' + r.id);
            if (card) {
              card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        });
      }
    });
  }

  // Seleccionar recicladora desde la lista
  seleccionarRecicladora(recicladora: Recicladora, cardElement: HTMLElement): void {
    this.recicladoraSeleccionada = recicladora;
    
    if (recicladora.latitud !== null && recicladora.longitud !== null) {
      // Centrar el mapa en la posición de la recicladora seleccionada
      this.mapa.flyTo({
        center: [recicladora.longitud, recicladora.latitud], 
        zoom: 15, 
        essential: true
      });
    }

    // Si hay una ruta activa, eliminarla
    if (this.rutaActiva) {
      this.limpiarRuta();
    }

    setTimeout(() => {
      cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  // Centrar el mapa en la ubicación inicial
  centrarMapa(): void {
    this.mapa.flyTo({
      center: [-96.7434342, 17.0588186],
      zoom: 12,
      essential: true
    });
    
    // Limpiar selección y ruta
    this.recicladoraSeleccionada = null;
    this.limpiarRuta();
  }

  // Obtener ubicación actual del usuario
//   obtenerMiUbicacion(): void {
//   if (!navigator.geolocation) {
//     alert('Tu navegador no soporta la geolocalización');
//     return;
//   }
  
//   // Verificar si ya se ha dado permiso previamente
//   const permisoUbicacionConcedido = localStorage.getItem('permisoUbicacionConcedido') === 'true';
  
//   const solicitarUbicacion = () => {
//     // Mostrar un indicador de carga más elegante
//     const loadingElement = document.createElement('div');
//     loadingElement.className = 'loading-location';
//     loadingElement.innerHTML = `
//       <div class="loading-container">
//         <div class="loading-spinner"></div>
//         <p>Obteniendo tu ubicación...</p>
//       </div>
//     `;
//     document.body.appendChild(loadingElement);
    
//     navigator.geolocation.getCurrentPosition(
//       position => {
//         // Guardar que el usuario ha concedido permiso
//         localStorage.setItem('permisoUbicacionConcedido', 'true');
        
//         // Eliminar indicador de carga
//         if (document.body.contains(loadingElement)) {
//           document.body.removeChild(loadingElement);
//         }
        
//         const { longitude, latitude } = position.coords;
//         this.userLocation = [longitude, latitude];
        
//         // Centrar mapa en la ubicación del usuario
//         this.mapa.flyTo({
//           center: this.userLocation,
//           zoom: 15,
//           essential: true
//         });
        
//         // Crear marcador de ubicación
//         const userMarkerEl = document.createElement('div');
//         userMarkerEl.className = 'current-user-marker';
//         userMarkerEl.innerHTML = `
//           <div class="user-marker-dot">
//             <div class="user-marker-pulse"></div>
//           </div>
//         `;
        
//         // Eliminar marcadores anteriores de usuario
//         this.routeMarkers.forEach(marker => marker.remove());
//         this.routeMarkers = [];
        
//         // Añadir nuevo marcador
//         const userMarker = new mapboxgl.Marker(userMarkerEl)
//           .setLngLat(this.userLocation)
//           .addTo(this.mapa);
          
//         this.routeMarkers.push(userMarker);
//       },
//       error => {
//         // Eliminar indicador de carga
//         if (document.body.contains(loadingElement)) {
//           document.body.removeChild(loadingElement);
//         }
        
//         // Si se deniega el permiso, actualizar el estado
//         if (error.code === error.PERMISSION_DENIED) {
//           localStorage.setItem('permisoUbicacionConcedido', 'false');
//         }
        
//         // Mensaje más amigable basado en el código de error
//         let mensaje = 'No se pudo obtener tu ubicación. ';
        
//         switch (error.code) {
//           case error.PERMISSION_DENIED:
//             mensaje += 'Has denegado el permiso de ubicación. Para habilitarlo, ve a la configuración de tu navegador, busca los permisos del sitio y habilita la ubicación.';
//             break;
//           case error.POSITION_UNAVAILABLE:
//             mensaje += 'La información de ubicación no está disponible en este momento.';
//             break;
//           case error.TIMEOUT:
//             mensaje += 'Se agotó el tiempo de espera para obtener la ubicación.';
//             break;
//           default:
//             mensaje += 'Por favor, verifica los permisos del navegador e inténtalo nuevamente.';
//         }
        
//         alert(mensaje);
//         console.error('Error de geolocalización:', error);
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 10000, // 10 segundos
//         maximumAge: 0
//       }
//     );
//   };
  
//   // Si ya se dio permiso previamente, solicitar ubicación directamente
//   if (permisoUbicacionConcedido) {
//     solicitarUbicacion();
//   } else {
//     // Si no hay historial de permiso, preguntar primero
//     if (confirm('Esta aplicación necesita acceder a tu ubicación para mostrarte las recicladoras cercanas y calcular rutas. ¿Deseas permitir el acceso a tu ubicación?')) {
//       solicitarUbicacion();
//     } else {
//       alert('Has decidido no compartir tu ubicación. Algunas funcionalidades como calcular rutas no estarán disponibles.');
//     }
//   }
// }

// Obtener ubicación fija (sin usar geolocalización)
obtenerMiUbicacion(): void {
  // Coordenadas fijas, por ejemplo, CDMX
  const ubicacionFija: [number, number] = [-96.72034307154908, 17.01998424478631];
  
  this.userLocation = ubicacionFija;

  // Centrar mapa en la ubicación fija
  this.mapa.flyTo({
    center: this.userLocation,
    zoom: 15,
    essential: true
  });

  // Crear marcador de ubicación fija
  const userMarkerEl = document.createElement('div');
  userMarkerEl.className = 'current-user-marker';
  userMarkerEl.innerHTML = `
    <div class="user-marker-dot">
      <div class="user-marker-pulse"></div>
    </div>
  `;

  // Eliminar marcadores anteriores de usuario
  this.routeMarkers.forEach(marker => marker.remove());
  this.routeMarkers = [];

  // Añadir nuevo marcador con ubicación fija
  const userMarker = new mapboxgl.Marker(userMarkerEl)
    .setLngLat(this.userLocation)
    .addTo(this.mapa);

  this.routeMarkers.push(userMarker);
}

  
  // Calcular ruta desde la ubicación del usuario hasta la recicladora seleccionada
    // Calcular ruta desde la ubicación del usuario hasta la recicladora seleccionada
  calcularRuta(): void {
    if (!this.userLocation) {
      this.obtenerMiUbicacion();
      setTimeout(() => this.calcularRuta(), 1000); // Intentar nuevamente después de obtener ubicación
      return;
    }
    
    if (!this.recicladoraSeleccionada || 
        this.recicladoraSeleccionada.latitud === null || 
        this.recicladoraSeleccionada.longitud === null) {
      alert('Selecciona una recicladora primero');
      return;
    }
    
    // Coordenadas origen (usuario) y destino (recicladora)
    const start = this.userLocation;
    const end: [number, number] = [this.recicladoraSeleccionada.longitud, this.recicladoraSeleccionada.latitud];
    
    // Limpiar ruta anterior si existe
    this.limpiarRuta();
    
    // Solicitar la ruta a la API de Mapbox Directions
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const routeDistance = (route.distance / 1000).toFixed(1); // km
          const routeDuration = Math.floor(route.duration / 60); // minutos
          
          // Añadir la ruta al mapa
          if (this.mapa.getSource('route')) {
            (this.mapa.getSource('route') as mapboxgl.GeoJSONSource).setData({
              type: 'Feature',
              properties: {},
              geometry: route.geometry
            });
          } else {
            this.mapa.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: route.geometry
              }
            });
            
            this.mapa.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#1b5741',
                'line-width': 5,
                'line-opacity': 0.75
              }
            });
            
            // Añadir información de la ruta
            this.rutaActiva = true;
            
            // Ajustar mapa para ver toda la ruta
            const bounds = new mapboxgl.LngLatBounds()
              .extend(start)
              .extend(end);
              
            this.mapa.fitBounds(bounds, {
              padding: 100,
              maxZoom: 15
            });
            
            // Mostrar información de la ruta
            console.log(`Distancia: ${routeDistance} km, Tiempo estimado: ${routeDuration} minutos`);
            
            // Mostrar diálogo para abrir en mapas externos
            this.mostrarDialogoMapasExternos(start, end);
          }
        }
      })
      .catch(error => {
        console.error('Error al calcular la ruta:', error);
        alert('No se pudo calcular la ruta en este momento.');
      });
  }
  
    // Método para mostrar diálogo de mapas externos
  mostrarDialogoMapasExternos(start: [number, number], end: [number, number]): void {
    // Si existe un diálogo anterior, lo eliminamos
    const existingDialog = document.getElementById('external-maps-dialog');
    if (existingDialog) {
      document.body.removeChild(existingDialog);
    }
    
        // Crear enlaces para Google Maps y Waze
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${start[1]},${start[0]}&destination=${end[1]},${end[0]}&travelmode=driving`;
    // URL de Waze: incluir tanto origen como destino
    const wazeUrl = `https://www.waze.com/ul?navigate=yes&from=ll.${start[1]},${start[0]}&to=ll.${end[1]},${end[0]}`;
    
    // Crear el diálogo
    const dialog = document.createElement('div');
    dialog.id = 'external-maps-dialog';
    dialog.className = 'external-maps-dialog';
    dialog.innerHTML = `
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>Ver ruta en aplicaciones externas</h3>
          <button class="close-btn" id="close-dialog-btn">×</button>
        </div>
        <div class="dialog-body">
          <p>Abre esta ruta en tu aplicación preferida:</p>
          <div class="maps-buttons">
            <a href="${googleMapsUrl}" class="map-btn google-btn" target="_blank">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#4285F4" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
              Google Maps
            </a>
            <a href="${wazeUrl}" class="map-btn waze-btn" target="_blank">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="#33CCFF" d="M19.03 6.03a9 9 0 00-14.06 0L12 14.06l7.03-8.03zM12 14.06L4.97 6.03C3.07 8.14 2 10.07 2 13a6.8 6.8 0 003.45 5.99A9.23 9.23 0 0012 20c2.3 0 4.34-.53 6.55-1.01A6.8 6.8 0 0022 13c0-2.93-1.07-4.86-2.97-6.97L12 14.06z"/>
              </svg>
              Waze
            </a>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Configurar el botón de cierre
    const closeBtn = document.getElementById('close-dialog-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.body.removeChild(dialog);
      });
    }
    
    // También cerrar al hacer clic fuera del diálogo
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        document.body.removeChild(dialog);
      }
    });
    
    // Mostrar el diálogo con una animación
    setTimeout(() => {
      dialog.classList.add('active');
    }, 100);
  }
  
  // Limpiar la ruta actual del mapa
  limpiarRuta(): void {
    if (this.mapa.getLayer('route')) {
      this.mapa.removeLayer('route');
    }
    
    if (this.mapa.getSource('route')) {
      this.mapa.removeSource('route');
    }
    
    this.routeMarkers.forEach(marker => marker.remove());
    this.routeMarkers = [];
    this.rutaActiva = false;
  }
}