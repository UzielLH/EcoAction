import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import mapboxgl from '../../utils/mapbox-token';
@Component({
  selector: 'app-mapa',
  imports: [CommonModule],
  templateUrl: './mapa.component.html',
  styles: ``
})
export class MapaComponent implements OnInit {
  mapa!: mapboxgl.Map;

  recicladoras = [
    {
      id: 1,
      nombre: 'Recicladora "volcanes"',
      direccion: 'C. Zempoaltepetl 322, Volcanes...',
      telefono: '+52 9516957695',
      horario: 'Lunes a Viernes 8am - 6pm',
      imagen: 'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=gpHxi88eYc5ji8Vobo1UkQ&cb_client=search.gws-prod.gps&w=408&h=240&yaw=105.93318&pitch=0&thumbfov=100',
      lat: 17.0795,
      lng: -96.7189
    },
    // más recicladoras...
  ];

  recicladoraSeleccionada: any = null;

  ngOnInit(): void {
    console.log('Inicializando mapa...');
    this.mapa = new mapboxgl.Map({
      container: 'mapa',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-96.72, 17.07],
      zoom: 12
    });

    this.recicladoras.forEach((r) => {
      console.log(`Agregando marcador en: ${r.lat}, ${r.lng}`);
      const markerElement = new mapboxgl.Marker()
        .setLngLat([r.lng, r.lat])
        .addTo(this.mapa)
        const popup = new mapboxgl.Popup({ offset: 25 })
        .setText(r.nombre);
        markerElement.setPopup(popup);

        markerElement.getElement().addEventListener('click', () => {
        this.recicladoraSeleccionada = r;
      });
    });
  }
}