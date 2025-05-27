import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { constApi } from '../envirioments/constApi';
const APIURL=constApi.APIURL;

@Injectable({
  providedIn: 'root'
})
export class MonederoService {
  private _http=inject(HttpClient);

  constructor() { }
  buscarMonederoPorId(uuid: string) {
    const url = `${APIURL}walletservice/api/walletservice/getMonederoByUUUID?uuid=${uuid}`;
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
