import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
const APIURL='http://175.1.42.56:8082/';

@Injectable({
  providedIn: 'root'
})
export class CreacionEmpresaService {
private _http=inject(HttpClient);

  constructor() { }
  crearEmpresa(empresa: any) {
    const url = `${APIURL}api/keycloak/empresa/crearEmpresa`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(empresa)
    })
    .then(response => response.json())
    .catch(error => {
      console.error('Error al crear la empresa:', error);
      throw error;
    });
  }
}
