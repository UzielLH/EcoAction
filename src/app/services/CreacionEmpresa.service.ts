import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { constApi } from '../envirioments/constApi';
const APIURL=constApi.APIURL;

@Injectable({
  providedIn: 'root'
})
export class CreacionEmpresaService {
private _http=inject(HttpClient);

  constructor() { }
  crearEmpresa(empresa: any) {
    const url = `${APIURL}usuarioskeycloak/api/keycloak/empresa/crearEmpresa`;
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

  subirImagen(id: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this._http.post(`${APIURL}usuarios/api/usuarios/empresa/${id}/imagen`, formData);
  }
}
