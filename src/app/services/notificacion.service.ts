import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { constApi } from '../envirioments/constApi';

const APIURL = constApi.APIURL;
const RECONNECT_TIMEOUT = 5000;
const MAX_RETRIES = 3;

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private eventSource: EventSource | null = null;
  private retryCount = 0;

  getNotificacionesByUserUuid(userUuid: string): Observable<any> {
    return new Observable(observer => {
      const connect = () => {
        if (this.eventSource) {
          this.eventSource.close();
        }

        this.eventSource = new EventSource(
          `${APIURL}transaccionservice/api/transacciones/notificacion/suscribir/${userUuid}`
        );

        this.eventSource.onopen = () => {
          console.log('Conexión SSE establecida');
          this.retryCount = 0; // Resetear contador al conectar exitosamente
        };

        this.eventSource.addEventListener('CONEXION', (event: MessageEvent) => {
          console.log('Evento de conexión:', event.data);
        });

        this.eventSource.addEventListener('NOTIFICACION', (event: MessageEvent) => {
          try {
            const notificacion = JSON.parse(event.data);
            observer.next(notificacion);
          } catch (error) {
            console.error('Error al parsear notificación:', error);
          }
        });

        this.eventSource.addEventListener('HEARTBEAT', (event: MessageEvent) => {
          console.log('Heartbeat recibido:', event.data);
        });

        this.eventSource.onerror = (error) => {
          console.error('Error SSE:', error);
          this.eventSource?.close();
          
          if (this.retryCount < MAX_RETRIES) {
            this.retryCount++;
            console.log(`Reintento ${this.retryCount} de ${MAX_RETRIES}`);
            setTimeout(connect, RECONNECT_TIMEOUT);
          } else {
            observer.error('Máximo número de reintentos alcanzado');
          }
        };
      };

      connect();

      // Cleanup al desuscribirse
      return () => {
        if (this.eventSource) {
          console.log('Cerrando conexión SSE');
          this.eventSource.close();
          this.eventSource = null;
        }
      };
    });
  }
}