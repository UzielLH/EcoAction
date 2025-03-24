import { Component, Input } from '@angular/core';
import Swal from 'sweetalert2';

interface Meta {
  nombreMeta: string;
  cantidadMonedas: number;
  cantidadTotal: number;
  descripcion: string;
  linkImagen: string;
}

@Component({
  selector: 'app-metas-card',
  imports: [],
  templateUrl: './metas-card.component.html',
  styles: ''
})
export class MetasCardComponent {
  @Input() meta!: Meta;
  @Input() userRole: 'user' | 'admin' | 'empresa' | null = null;

}
