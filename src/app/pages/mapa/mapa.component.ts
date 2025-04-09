import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-mapa',
  imports: [CommonModule],
  templateUrl: './mapa.component.html',
  styles: ``
})
export class MapaComponent {

  recicladoras = [
    {
      id: 1,
      nombre: 'Recicladora "volcanes"',
      direccion: 'C. Zempoaltepetl 322, Volcanes, 68020 Oaxaca de Juárez, Oax.',
      telefono: '+52 9516957695',
      horario: 'Lunes a Viernes 8am - 6pm',
      imagen: 'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=gpHxi88eYc5ji8Vobo1UkQ&cb_client=search.gws-prod.gps&w=408&h=240&yaw=105.93318&pitch=0&thumbfov=100'
    },
    {
      id: 2,
      nombre: 'Contenedor Reciclando de Corazón',
      direccion: 'Fovissste, 68027 Oaxaca de Juárez, Oax.',
      telefono: '987654321',
      horario: 'Lunes a Viernes 10am - 6pm',
      imagen: 'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=u2FUnbYVDZKoyvCCjNUiNA&cb_client=search.gws-prod.gps&w=408&h=240&yaw=232.31395&pitch=0&thumbfov=100'
    },
    {
      id: 3,
      nombre: 'Recicla Papel Oaxaca',
      direccion: 'Sabinos 100, Paraje La Maguellera, 68276 Oaxaca de Juárez, Oax.',
      telefono: '+52 9515228100',
      horario: 'Lunes a Viernes 8am - 5pm',
      imagen: 'https://lh3.googleusercontent.com/gps-cs-s/AB5caB891qNXeW7pohchNUR7XKIoJyX5VcQT6EaIPOH6dcyHnLHTRDD8KIhLcRChxWzKnhL0sU_9ThMnng6yOmcwNvqVaIaYgAQHyITNsl8sZ88z10lk3sLeWlMQCt9kTGJsO9383Ns=w426-h240-k-no'
    },
    {
      id: 4,
      nombre: 'RECICLADORA "LA VERDE ANTEQUERA"',
      direccion: 'C. Zempoaltepetl 222, Volcanes, 68020 Oaxaca de Juárez, Oax.',
      telefono: '+52 9511784882',
      horario: 'Lunes a Viernes 9am - 6pm',
      imagen: 'https://lh3.googleusercontent.com/gps-cs-s/AB5caB9etnFdvsnFS3IK14r3Lm1Za_LGJIhEld0ZPqcomYU-9bYpzeb9HazFQ4KtU3bpLJ58Sp93Xcn18p208aQEKLQ9mitQKJ6WabTy8qDLb0Ob_80lJopanpkGjiZFq1Ss95tNc-8K=w408-h544-k-no'
    },
  ];
}
