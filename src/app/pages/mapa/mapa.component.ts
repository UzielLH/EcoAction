import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import mapboxgl from '../../utils/mapbox-token';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MapService } from '../../services/map.service';
@Component({
  selector: 'app-mapa',
  imports: [CommonModule],
  templateUrl: './mapa.component.html',
  styles: ``
})
export class MapaComponent implements OnInit {
  mapa!: mapboxgl.Map;
  private fb=inject(FormBuilder);
  private mapService = inject(MapService);

  recicladoras = [
    {
      id: null,
      nombre: '',
      direccion: '',
      telefono: '',
      horario: '',
      imagen: '',
      lat: null,
      lng: null
    },
  ];

  recicladoraSeleccionada: any = null;

  ngOnInit(): void {
    console.log('Inicializando mapa...');
    this.mapa = new mapboxgl.Map({
      container: 'mapa',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-96.7434342, 17.0588186],
      zoom: 12,
      attributionControl: false
    });

    this.mapa.addControl(new mapboxgl.AttributionControl({ compact: true }), 'top-right');

    // Obtener recicladoras del backend
    this.mapService.getRecicladoras().subscribe((data: any) => {
      this.recicladoras = data; 
      this.recicladoras.forEach((r: any) => {
        const markerElement = new mapboxgl.Marker()
          .setLngLat([r.longitud, r.latitud])
          .addTo(this.mapa);
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setText(r.nombre);
        markerElement.setPopup(popup);

        markerElement.getElement().addEventListener('click', () => {
          // Cuando seleccionas desde el mapa:
          this.recicladoraSeleccionada = r;
          setTimeout(() => {
            const card = document.getElementById('card-' + r.id);
            if (card) {
              card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 0);
        });
      });
    });
  }

  seleccionarRecicladora(recicladora: any, cardElement: HTMLElement) {
    this.recicladoraSeleccionada = recicladora;
    // Centrar el mapa en la posición de la recicladora seleccionada
    this.mapa.flyTo({
      center: [recicladora.longitud, recicladora.latitud], 
      zoom: 15, 
      essential: true
    });

    setTimeout(() => {
      cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  }
}