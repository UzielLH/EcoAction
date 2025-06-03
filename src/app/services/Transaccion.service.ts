import { inject, Injectable } from '@angular/core';
import { constApi } from '../envirioments/constApi';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
const APIURL=constApi.APIURL;

@Injectable({
  providedIn: 'root'
})
export class TransaccionService {
  private _http=inject(HttpClient);

  constructor() { }
  RealizarDonacion(usuarioId: string, monto: number, metaId: string) {
    const url = `${APIURL}transaccionservice/api/transacciones/donaciones`;
    const body = {
      usuarioId,
      monto,
      datosEspecificos: {
        metaId
      }
    };
    return this._http.post(url, body);
  }

  crearRecarga(usuarioId: string, monto: number, nombreTarjeta: string, numeroTarjeta: string) {
    const url = `${APIURL}transaccionservice/api/transacciones/recargas`;
    const body = {
      usuarioId,
      monto,
      datosEspecificos: {
        nombreTarjeta,
        numeroTarjeta
      }
    };
    return this._http.post(url, body);
  }

  EmpresaAUsuario(usuarioId: string, empresaId: string, monto: number) {
    const url = `${APIURL}transaccionservice/api/transacciones/transferencias`;
    const body = {
      usuarioId,
      monto,
      datosEspecificos: {
        empresaId
      }
    };
    return this._http.post(url, body);
  }

  TransaccionesUsuario(usuarioId: string): Observable<any[]> {
    const url = `${APIURL}transaccionservice/api/transacciones/usuario/${usuarioId}`;
    return this._http.get<any[]>(url);
  }

  ListarDonacion(): Observable<any[]> {
    const url = `${APIURL}transaccionservice/api/transacciones/tipo/DONACION`;
    return this._http.get<any[]>(url);
  }

  ListarRecarga(): Observable<any[]> {
    const url = `${APIURL}transaccionservice/api/transacciones/tipo/RECARGA`;
    return this._http.get<any[]>(url);
  }

  ListarTransacciones(): Observable<any[]> {
    const url = `${APIURL}transaccionservice/api/transacciones`;
    return this._http.get<any[]>(url);
  }

  ListarTransferencia(): Observable<any[]> {
    const url = `${APIURL}transaccionservice/api/transacciones/tipo/TRANSFERENCIA`;
    return this._http.get<any[]>(url);
  }

  ObtenerUsernameUsuario(uuidKeycloak: string): Observable<string> {
    return this._http.get(
      `${APIURL}usuarios/api/usuarios/usuario/get-username-by-uuidkeycloak?uuidKeycloak=${uuidKeycloak}`,
      { responseType: 'text' }
    );
  }

  ObtenerNombreEmpresa(empresaId: string): Observable<string> {
    return this._http.get(
      `${APIURL}usuarios/api/usuarios/empresa/find-username-by-uuid-keycloak?uuidKeycloak=${empresaId}`,
      { responseType: 'text' }
    );
  }
}