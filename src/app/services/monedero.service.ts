import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
const APIURL='http://175.1.60.21:8084/';

@Injectable({
  providedIn: 'root'
})
export class MonederoService {
  private _http=inject(HttpClient);

  constructor() { }
  buscarMonederoPorId(uuid: string) {
    const url = `${APIURL}api/walletservice/getMonederoByUUUID?uuid=${uuid}`;
    return this._http.get(url);
  }

  agregarSaldo(uuid: string, saldo: number) {
    const url = `${APIURL}api/walletservice/agregarSaldo?uuid=${uuid}&saldo=${saldo}`;
    return this._http.post(url, null);
  }

  descontarSaldo(uuid: string, saldo: number) {
    const url = `${APIURL}api/walletservice/descontarSaldo?uuid=${uuid}&saldo=${saldo}`;
    return this._http.post(url, null);
  }
}
