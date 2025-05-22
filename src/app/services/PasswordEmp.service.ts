import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

const APIURL='http://175.1.42.56:8082/';
const APIURL2='http://175.1.42.56:8081/';
@Injectable({
  providedIn: 'root'
})
export class PasswordEmpService {
private _http=inject(HttpClient);

  constructor() { }
  cambiarContraseña(userUuid: string, contrasena: string) {
  const url = `http://175.1.51.61:8082/api/keycloak/empresa/actualizarContrasena?id=${userUuid}`;
  const body = { contrasena };
  return this._http.put(url, body);
}
  DatosEmpresa(){
    return this._http.get(APIURL2+'api/usuarios/empresa/find-all');
  }
}
