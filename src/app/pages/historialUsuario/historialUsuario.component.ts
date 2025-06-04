import { ChangeDetectionStrategy, Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { TransaccionService } from '../../services/Transaccion.service';
import { MetasService } from '../../services/metas.service';
import { CommonModule } from '@angular/common';
import { forkJoin, Observable, of } from 'rxjs';
import { mergeMap, map, catchError } from 'rxjs/operators';

interface Transaccion {
  id: number;
  username: string;
  fecha: string;
  tipo: string;
  monto: number;
  datosEspecificos: any;
}

@Component({
  selector: 'app-historial-usuario',
  imports: [CommonModule],
  templateUrl: './historialUsuario.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class HistorialUsuarioComponent implements OnInit { 
  private transaccionService = inject(TransaccionService);
  private metasService = inject(MetasService); // Inyectar servicio de metas
  private cdr = inject(ChangeDetectorRef); // Inyectar ChangeDetectorRef
  
  transacciones: Transaccion[] = [];
  transaccionesFiltradas: Transaccion[] = []; // Transacciones para la página actual
  loading = true;
  transaccionesCargadas:Boolean = false; // Indica si las transacciones ya fueron cargadas
  error: string | null = null;
  
  // Propiedades de paginación
  paginaActual = 1;
  elementosPorPagina = 10;
  totalPaginas = 1;
  
  // Nueva propiedad para almacenar la transacción seleccionada
  transaccionSeleccionada: Transaccion | null = null;
  
  ngOnInit() {
    const usuarioId = localStorage.getItem('userUuid') || '';
    console.log('Obtenido usuarioId:', usuarioId);
    this.cargarTransacciones(usuarioId);
  }

  cargarTransacciones(usuarioId: string) {
    console.log('Cargando transacciones para:', usuarioId);
    
    // Primero obtener las transacciones y el username
    this.transaccionService.TransaccionesUsuario(usuarioId).pipe(
      mergeMap(transacciones => {
        // Obtener el username
        const username$ = this.transaccionService.ObtenerUsernameUsuario(usuarioId);
        
        // Para cada transacción, obtener datos adicionales según su tipo
        const observables = transacciones.map(tx => {
          // Para donaciones, obtener el nombre de la meta
          const meta$ = tx.tipo === 'DONACION' && tx.datosEspecificos?.metaId ? 
            this.metasService.buscarMeta(tx.datosEspecificos.metaId).pipe(
              map(meta => meta?.nombreMeta || ''),
              catchError(() => of(''))
            ) : 
            of('');
            
          // Para transferencias, obtener el nombre de la empresa (si fuera necesario)
          const empresa$ = tx.tipo === 'TRANSFERENCIA' && tx.datosEspecificos?.empresaId ? 
            this.transaccionService.ObtenerNombreEmpresa(tx.datosEspecificos.empresaId).pipe(
              catchError(() => of(''))
            ) : 
            of('');
            
          return forkJoin({
            tx: of(tx),
            nombreMeta: meta$,
            nombreEmpresa: empresa$
          });
        });
        
        // Combinar el resultado de todas las observables
        return forkJoin({
          transaccionesData: forkJoin(observables),
          username: username$
        });
      })
    ).subscribe({
      next: ({ transaccionesData, username }) => {
        console.log('Datos de transacciones obtenidos');
        
        // Construir transacciones con datos completos
        this.transacciones = transaccionesData.map(({ tx, nombreMeta, nombreEmpresa }) => ({
          ...tx,
          username: username || 'Usuario Desconocido',
          datosEspecificos: {
            ...tx.datosEspecificos,
            nombreMeta: nombreMeta || '',
            nombreEmpresa: nombreEmpresa || ''
          }
        }));
        
        this.calcularTotalPaginas();
        this.aplicarPaginacion();
        this.loading = false;
        this.cdr.detectChanges();
        this.transaccionesCargadas = true; // Marcar que las transacciones fueron cargadas
      },
      error: (err) => {
        console.error('Error en la petición:', err);
        this.error = 'Error al cargar las transacciones';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  // Métodos para paginación
  calcularTotalPaginas() {
    this.totalPaginas = Math.ceil(this.transacciones.length / this.elementosPorPagina);
  }
  
  aplicarPaginacion() {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    this.transaccionesFiltradas = this.transacciones.slice(inicio, fin);
  }
  
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

  // Métodos de ayuda para la presentación
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
    // Eliminar espacios si existen
    const cleaned = cardNumber.replace(/\s+/g, ''); 
    // Mostrar solo los últimos 4 dígitos
    return '•••• •••• •••• ' + cleaned.slice(-4);
  }

  getTransactionDescription(transaction: Transaccion): string {
    switch (transaction.tipo) {
      case 'RECARGA':
        return `Recarga con tarjeta ${this.formatCardNumber(transaction.datosEspecificos?.numeroTarjeta)}`;
      case 'DONACION':
        return transaction.datosEspecificos?.nombreMeta ? 
          `Donación a meta "${transaction.datosEspecificos.nombreMeta}"` : 
          `Donación a meta #${transaction.datosEspecificos?.metaId}`;
      case 'TRANSFERENCIA':
        return transaction.datosEspecificos?.nombreEmpresa ?
          `Transferencia de "${transaction.datosEspecificos.nombreEmpresa}"` :
          `Transferencia de empresa ${(transaction.datosEspecificos?.empresaId || '').substring(0, 8)}...`;
      default:
        return 'Transacción';
    }
  }
  
  // Nuevos métodos para mostrar y cerrar detalles
  mostrarDetalles(tx: Transaccion) {
    this.transaccionSeleccionada = tx;
    this.cdr.detectChanges();
  }
  
  cerrarDetalles() {
    this.transaccionSeleccionada = null;
    this.cdr.detectChanges();
  }
  
  // Helper para convertir keys a string para pipes
  keyToString(key: unknown): string {
    return String(key);
  }
}