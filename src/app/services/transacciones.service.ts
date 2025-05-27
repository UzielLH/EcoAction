import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { constApi } from '../envirioments/constApi';
const APIURL=constApi.APIURL;

@Injectable({
  providedIn: 'root'
})
export class TransaccionesService {
private _http=inject(HttpClient);

  constructor() { }
  donar(donacion: {
    usuarioId: string;
    monto: number;
    datosEspecificos: { metaId: number };
  }) {
    const url = `${APIURL}transaccionservice/api/transacciones/donaciones`;
    return this._http.post(url, donacion);
  }
}
