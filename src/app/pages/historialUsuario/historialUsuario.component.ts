import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetasService } from '../../services/metas.service';
import { catchError, forkJoin, map, mergeMap, of } from 'rxjs';
import { TransaccionService } from '../../services/Transaccion.service';

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
  // Servicios inyectados
  private transaccionService = inject(TransaccionService);
  private metasService = inject(MetasService); 
  private cdr = inject(ChangeDetectorRef);
  
  // Propiedades del componente
  transacciones: Transaccion[] = [];
  transaccionesFiltradas: Transaccion[] = []; 
  loading = true;
  transaccionesCargadas = false;
  error: string | null = null;
  
  // Propiedades de paginación
  paginaActual = 1;
  elementosPorPagina = 10;
  totalPaginas = 1;
  
  // Transacción seleccionada para el modal
  transaccionSeleccionada: Transaccion | null = null;
  
  // Escuchar la tecla ESC para cerrar el modal
  @HostListener('document:keydown.escape', ['$event'])
  handleEscKey(event: KeyboardEvent) {
    this.cerrarDetalles();
  }
  
  ngOnInit() {
    const usuarioId = localStorage.getItem('userUuid') || '';
    console.log('Obtenido usuarioId:', usuarioId);
    this.cargarTransacciones(usuarioId);
  }

  cargarTransacciones(usuarioId: string) {
    console.log('Cargando transacciones para:', usuarioId);
    this.loading = true;
    this.error = null;
    this.transaccionesCargadas = false;
    
    // Primero obtener las transacciones y el username
    this.transaccionService.TransaccionesUsuario(usuarioId).pipe(
      mergeMap(transacciones => {
        // Si no hay transacciones, manejar el caso
        if (transacciones.length === 0) {
          return of({ transaccionesData: [], username: "Usuario" });
        }
        
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
            
          // Para transferencias, obtener el nombre de la empresa
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
      }),
      catchError(err => {
        console.error('Error al cargar transacciones:', err);
        return of({ transaccionesData: [], username: "Error" });
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
        this.transaccionesCargadas = true; // Marcar que las transacciones fueron cargadas
        console.log('Transacciones cargadas:', this.transaccionesCargadas);
        console.log('Total transacciones:', this.transacciones.length);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error en la petición:', err);
        this.error = 'Error al cargar las transacciones';
        this.loading = false;
        this.transaccionesCargadas = true; // Marcar que se intentó cargar
        this.cdr.detectChanges();
      }
    });
  }
  
  // Métodos de paginación
  calcularTotalPaginas() {
    this.totalPaginas = Math.ceil(this.transacciones.length / this.elementosPorPagina);
  }
  
  aplicarPaginacion() {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    this.transaccionesFiltradas = this.transacciones.slice(inicio, fin);
  }
  
  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.aplicarPaginacion();
    }
  }
  
  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.aplicarPaginacion();
    }
  }
  
  irAPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.aplicarPaginacion();
    }
  }
  
  obtenerNumerosPagina(): number[] {
    const paginas: number[] = [];
    const totalMostrar = 5; // Mostrar máximo 5 números
    
    let inicio = Math.max(1, this.paginaActual - Math.floor(totalMostrar / 2));
    let fin = Math.min(this.totalPaginas, inicio + totalMostrar - 1);
    
    if (fin - inicio + 1 < totalMostrar) {
      inicio = Math.max(1, fin - totalMostrar + 1);
    }
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }
  
  // Métodos para el modal de detalles
  mostrarDetalles(tx: Transaccion) {
    console.log('Mostrando detalles de transacción:', tx);
    this.transaccionSeleccionada = tx;
    
    // Forzar la actualización del DOM
    setTimeout(() => {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
  }
  
  cerrarDetalles() {
    console.log('Cerrando detalles');
    this.transaccionSeleccionada = null;
    this.cdr.detectChanges();
  }
  
  // Utilidades para formatear y mostrar información
  getColorForTransactionType(tipo: string): string {
    switch (tipo) {
      case 'RECARGA': return 'green';
      case 'DONACION': return 'purple';
      case 'TRANSFERENCIA': return 'blue';
      default: return 'gray';
    }
  }
  
  getIconForTransactionType(tipo: string): string {
    switch (tipo) {
      case 'RECARGA': return 'fa-wallet';
      case 'DONACION': return 'fa-hand-holding-heart';
      case 'TRANSFERENCIA': return 'fa-exchange-alt';
      default: return 'fa-circle';
    }
  }
  
  getTransactionDescription(tx: Transaccion): string {
    switch (tx.tipo) {
      case 'RECARGA':
        return `Recarga de saldo`;
      case 'DONACION':
        return `Donación a: ${tx.datosEspecificos?.nombreMeta || 'Meta desconocida'}`;
      case 'TRANSFERENCIA':
        return `Transferencia a: ${tx.datosEspecificos?.nombreEmpresa || 'Empresa desconocida'}`;
      default:
        return `Transacción ${tx.tipo.toLowerCase()}`;
    }
  }
  
  formatCardNumber(cardNumber: string): string {
    if (!cardNumber) return '';
    // Mostrar solo los últimos 4 dígitos
    return `**** **** **** ${cardNumber.slice(-4)}`;
  }
  
  keyToString(key: unknown): string {
  if (typeof key === 'string') {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .toLowerCase()
      .trim();
  }
  return String(key); // Convertir a string de manera segura si no es string
}
}