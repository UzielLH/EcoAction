import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { constApi } from '../envirioments/constApi';
import { Observable } from 'rxjs';

const APIURL=constApi.APIURL;

export interface Recicladora {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  horario: string;
  imagen: string;
  latitud: number | null;
  longitud: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private _http=inject(HttpClient);

  constructor() { }
  getRecicladoras(): Observable<Recicladora[]>{
    return this._http.get<Recicladora[]>(APIURL+'usuarios/api/usuarios/empresa/find-all');
  }
}
