import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs'; // Importar firstValueFrom para convertir Observable a Promise

const APIURL='http://175.1.32.17:8082/';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
private _http=inject(HttpClient);

  constructor() { }
  login(user:any){
    return this._http.post(APIURL+'api/keycloak/auth/login',user);
  }

  // async login(username: string, password: string): Promise<any> {
  // try {
  //   return await firstValueFrom(
  //     this._http.post(`${APIURL}api/keycloak/auth/login`, { username, password })
  //   );
  // } catch (error) {
  //   console.error('Error en el servicio de login:', error);
  //   throw new Error('No se pudo conectar con el servidor. Inténtalo más tarde.');
  // }
  // }
}