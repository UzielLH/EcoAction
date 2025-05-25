import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
const APIURL='http://175.1.60.21:8082/';

@Injectable({
  providedIn: 'root'
})
export class CreacionAdminService {
private _http=inject(HttpClient);

  constructor() { }
  crearAdmin(admin: any) {
    const url = `${APIURL}api/keycloak/admin/crearAdmin`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(admin)
    })
    .then(response => response.json())
    .catch(error => {
      console.error('Error al crear el admin:', error);
      throw error;
    });
  }
}
