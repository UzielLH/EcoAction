import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

const APIURL='http://175.1.60.21:8081/';
const APIURL2='http://175.1.60.21:8072/';
@Injectable({
  providedIn: 'root'
})
export class PasswordEmpService {
private _http=inject(HttpClient);

  constructor() { }
  cambiarContraseña(userUuid: string, contrasena: string) {
  const url = `http://175.1.60.21:8082/api/keycloak/empresa/actualizarContrasena?id=${userUuid}`;
  const body = { contrasena };
  return this._http.put(url, body);
}
  DatosEmpresa(uuidKeycloak: string) {
    const url = `${APIURL2}ecoaction/gatewayserver/usuarios/api/usuarios/empresa/find-by-uuid-keycloak?uuidKeycloak=${uuidKeycloak}`;
    // const url = `${APIURL}api/usuarios/empresa/find-by-uudid-keycloak?uuidKeycloak=${uuidKeycloak}`;
    return this._http.get(url);
  }
}