import { ChangeDetectionStrategy, Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { TransaccionService } from '../../services/Transaccion.service';
import { CommonModule } from '@angular/common';

interface Transaccion {
  id: number;
  usuarioId: string;
  fecha: string;
  tipo: string;
  monto: number;
  datosEspecificos: any;
}

@Component({
  selector: 'app-historial-todo',
  imports: [CommonModule],
  templateUrl: './historialTodo.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class HistorialTodoComponent implements OnInit {
  private transaccionService = inject(TransaccionService);
  private cdr = inject(ChangeDetectorRef);
  
  // Propiedades para almacenar transacciones
  transacciones: Transaccion[] = [];
  loading = true;
  error: string | null = null;
  activeTab = 'todas'; // 'todas', 'donaciones', 'recargas', 'transferencias'
  
  // Estadísticas
  totalTransacciones = 0;
  montoTotal = 0;
  
  
  // Nueva propiedad para la transacción seleccionada
  transaccionSeleccionada: Transaccion | null = null;
  
  ngOnInit() {
    this.cambiarTipo('todas');
  }

  keyToString(key: unknown): string {
    return String(key);
  }

  cambiarTipo(tipo: string) {
    this.activeTab = tipo;
    this.loading = true;
    this.error = null;
    
    let request;
    
    switch(tipo) {
      case 'donaciones':
        request = this.transaccionService.ListarDonacion();
        break;
      case 'recargas':
        request = this.transaccionService.ListarRecarga();
        break;
      case 'todas':
      default:
        request = this.transaccionService.ListarTransferencia();
        break;
    }
    
    request.subscribe({
      next: (data) => {
        this.transacciones = data;
        this.calcularEstadisticas();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando transacciones:', err);
        this.error = 'Error al cargar las transacciones. Intenta de nuevo más tarde.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  calcularEstadisticas() {
    this.totalTransacciones = this.transacciones.length;
    this.montoTotal = this.transacciones.reduce((total, tx) => total + tx.monto, 0);
  }

  // Métodos para formatear datos
  getIconForTransactionType(tipo: string): string {
    switch (tipo) {
      case 'RECARGA': return 'fa-credit-card';
      case 'DONACION': return 'fa-hand-holding-heart';
      case 'TRANSFERENCIA': return 'fa-exchange-alt';
      default: return 'fa-money-bill-wave';
    }
  }

  getColorForTransactionType(tipo: string): string {
    switch (tipo) {
      case 'RECARGA': return 'green';
      case 'DONACION': return 'purple';
      case 'TRANSFERENCIA': return 'blue';
      default: return 'gray';
    }
  }

  formatCardNumber(cardNumber: string): string {
    if (!cardNumber) return '';
    const cleaned = cardNumber.replace(/\s+/g, '');
    return '•••• •••• •••• ' + cleaned.slice(-4);
  }

  truncateUserId(userId: string): string {
    if (!userId) return '';
    return userId.substring(0, 8) + '...';
  }

  getTransactionDescription(transaction: Transaccion): string {
    switch (transaction.tipo) {
      case 'RECARGA':
        return `Recarga con tarjeta ${this.formatCardNumber(transaction.datosEspecificos?.numeroTarjeta)}`;
      case 'DONACION':
        return `Donación a meta #${transaction.datosEspecificos?.metaId}`;
      case 'TRANSFERENCIA':
        const empresaId = transaction.datosEspecificos?.empresaId || '';
        return `Transferencia de empresa ${empresaId.substring(0, 8)}...`;
      default:
        return 'Transacción';
    }
  }
  
  // Nuevos métodos para manejar la selección de transacciones
  mostrarDetalles(transaction: Transaccion) {
    this.transaccionSeleccionada = transaction;
    this.cdr.detectChanges();
  }
  
  cerrarDetalles() {
    this.transaccionSeleccionada = null;
    this.cdr.detectChanges();
  }
}