import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs'; // Importar firstValueFrom para convertir Observable a Promise
import { constApi } from '../envirioments/constApi';

const APIURL= constApi.APIURL;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
private _http=inject(HttpClient);

  constructor() { }
  login(user:any){
    return this._http.post(APIURL+'usuarioskeycloak/api/keycloak/auth/login',user);
  }
}