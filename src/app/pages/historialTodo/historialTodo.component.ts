import { ChangeDetectionStrategy, Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { TransaccionService } from '../../services/Transaccion.service';
import { CommonModule } from '@angular/common';
import { forkJoin, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

interface Transaccion {
  id: number;
  username: string;
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
  transaccionesFiltradas: Transaccion[] = []; // Transacciones para la página actual
  loading = true;
  error: string | null = null;
  activeTab = 'todas'; // 'todas', 'donaciones', 'recargas', 'transferencias'
  
  // Propiedades de paginación
  paginaActual = 1;
  elementosPorPagina = 10;
  totalPaginas = 1;
  
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
    this.paginaActual = 1;
    
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
    
    request.pipe(
      mergeMap(transacciones => {
        const observables = transacciones.map(tx => {
          const username$ = this.transaccionService.ObtenerUsernameUsuario(tx.usuarioId);
          const empresa$ = tx.tipo === 'TRANSFERENCIA' && tx.datosEspecificos?.empresaId ? 
            this.transaccionService.ObtenerNombreEmpresa(tx.datosEspecificos.empresaId) : 
            of('');
          return forkJoin({
            tx: of(tx),
            username: username$,
            nombreEmpresa: empresa$,
          });
        });

        return forkJoin(observables);
      })
    ).subscribe({
      next: (resultados) => {
        this.transacciones = resultados.map(({ tx, username, nombreEmpresa }) => ({
          ...tx,
          username: username || 'Usuario Desconocido',
          datosEspecificos: {
            ...tx.datosEspecificos,
            nombreEmpresa: nombreEmpresa || tx.datosEspecificos?.empresaId
          }
        }));

        this.calcularEstadisticas();
        this.aplicarPaginacion();
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
    this.totalPaginas = Math.ceil(this.totalTransacciones / this.elementosPorPagina);
  }
  
  // Método para aplicar la paginación
  aplicarPaginacion() {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    this.transaccionesFiltradas = this.transacciones.slice(inicio, fin);
  }
  
  // Métodos para navegar entre páginas
  irAPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.aplicarPaginacion();
      this.cdr.detectChanges();
    }
  }
  
  paginaAnterior() {
    this.irAPagina(this.paginaActual - 1);
  }
  
  paginaSiguiente() {
    this.irAPagina(this.paginaActual + 1);
  }
  
  // Genera un array con los números de página para mostrar
  obtenerNumerosPagina(): number[] {
    const paginasMostradas = 5; // Número de páginas a mostrar en la navegación
    const mitad = Math.floor(paginasMostradas / 2);
    
    let inicio = Math.max(this.paginaActual - mitad, 1);
    let fin = inicio + paginasMostradas - 1;
    
    if (fin > this.totalPaginas) {
      fin = this.totalPaginas;
      inicio = Math.max(fin - paginasMostradas + 1, 1);
    }
    
    return Array.from({length: (fin - inicio + 1)}, (_, i) => inicio + i);
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
        return `Transferencia de ${transaction.datosEspecificos?.nombreEmpresa}`;
      default:
        return 'Transacción';
    }
  }
  
  // Métodos para manejar la selección de transacciones
  mostrarDetalles(transaction: Transaccion) {
    this.transaccionSeleccionada = transaction;
    this.cdr.detectChanges();
  }
  
  cerrarDetalles() {
    this.transaccionSeleccionada = null;
    this.cdr.detectChanges();
  }
}