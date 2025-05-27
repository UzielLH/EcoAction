import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { constApi } from '../envirioments/constApi';
const APIURL=constApi.APIURL;

@Injectable({
  providedIn: 'root'
})
export class CreacionUserService {
private _http=inject(HttpClient);

  constructor() { }
  crearUsuario(usuario: any) {
    const url = `${APIURL}usuarioskeycloak/api/keycloak/user/signup`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(usuario)
    })
    .then(response => response.json())
    .catch(error => {
      console.error('Error al crear el usuario:', error);
      throw error;
    });
  }
}
