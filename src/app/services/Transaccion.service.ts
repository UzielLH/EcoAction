import { inject, Injectable } from '@angular/core';
import { constApi } from '../envirioments/constApi';
import { HttpClient } from '@angular/common/http';
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
}
