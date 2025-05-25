import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
const APIURL='http://175.1.60.21:8072/ecoaction/gatewayserver/';

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
