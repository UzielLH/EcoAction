import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { constApi } from '../envirioments/constApi';

const APIURL=constApi.APIURL;
@Injectable({
  providedIn: 'root'
})
export class PasswordEmpService {
private _http=inject(HttpClient);

  constructor() { }
  cambiarContraseña(userUuid: string, contrasena: string) {
  const url = `${APIURL}usuarioskeycloak/api/keycloak/empresa/actualizarContrasena?id=${userUuid}`;
  const body = { contrasena };
  return this._http.put(url, body);
}
  DatosEmpresa(uuidKeycloak: string) {
    const url = `${APIURL}usuarios/api/usuarios/empresa/find-by-uuid-keycloak?uuidKeycloak=${uuidKeycloak}`;
    // const url = `${APIURL}api/usuarios/empresa/find-by-uudid-keycloak?uuidKeycloak=${uuidKeycloak}`;
    return this._http.get(url);
  }
}