import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
const APIURL='http://175.1.60.21:8082/';

@Injectable({
  providedIn: 'root'
})
export class CreacionUserService {
private _http=inject(HttpClient);

  constructor() { }
  crearUsuario(usuario: any) {
    const url = `${APIURL}api/keycloak/user/signup`;
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
