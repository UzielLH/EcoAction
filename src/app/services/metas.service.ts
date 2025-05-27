import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { catchError, throwError } from 'rxjs';
import { constApi } from '../envirioments/constApi';
const APIURL=constApi.APIURL;

@Injectable({
  providedIn: 'root'
})
export class MetasService {
  private _http=inject(HttpClient);

  constructor() { }
  mostrarMetas(){
    const url = `${APIURL}metaservice/api/metas/find-all`;
    return this._http.get<Meta[]>(url); // Especificar el tipo de retorno
  }

  crearMeta(meta: any) {
    const url = `${APIURL}metaservice/api/metas/create`;
    return this._http.post(url, meta);
  }

  uploadImage(id: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this._http.post(`${APIURL}metaservice/api/metas/add-image?id=${id}`, formData);
  }

  donarMeta(id:number, donacion: number){
    const url = `${APIURL}api/metas/donate?id=${id}&donacion=${donacion}`;
    return this._http.post(url, null).pipe(
      catchError((error) => {
        console.error('Error al donar meta:', error);
        return throwError(error);
      })
    );
  }

  buscarMeta(id: number) {
    const url = `${APIURL}api/metas/find-by-id?id=${id}`;
    return this._http.get<Meta>(url); // Especificar el tipo de retorno
  }

}
