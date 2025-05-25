import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs'; // Importar firstValueFrom para convertir Observable a Promise

const APIURL='http://175.1.60.21:8082/';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
private _http=inject(HttpClient);

  constructor() { }
  login(user:any){
    return this._http.post(APIURL+'api/keycloak/auth/login',user);
  }
}