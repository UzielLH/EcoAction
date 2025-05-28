import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { constApi } from '../envirioments/constApi';

const APIURL = constApi.APIURL; // Asegúrate de importar constApi desde tu entorno

@Injectable({
  providedIn: 'root'
})
export class PuntosService {
  private _http = inject(HttpClient);

  constructor() { }
  
  // Método auxiliar para obtener encabezados con token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
  
  // Método para asignar puntos a un usuario
  asignarPuntos(datos: {usuarioId: string, monto: number, datosEspecificos: {empresaId: string}}): Observable<any> {
    const headers = this.getAuthHeaders();
    
    // Asegurarse de incluir el UUID del usuario que está asignando puntos
    if (!datos.datosEspecificos.empresaId) {
      datos.datosEspecificos.empresaId = localStorage.getItem('userUuid') || '';
    }
    
    return this._http.post(`${APIURL}transaccionservice/api/transacciones/transferencias`, datos);
  }
  
  // Opcionalmente: método para verificar si un usuario existe
  verificarUsuario(username: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this._http.get(`${APIURL}usuarios/api/usuarios/verificar/${username}`, { headers });
  }
}