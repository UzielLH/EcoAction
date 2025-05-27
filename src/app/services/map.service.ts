import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { constApi } from '../envirioments/constApi';

const APIURL=constApi.APIURL;

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private _http=inject(HttpClient);

  constructor() { }
  getRecicladoras(){
    return this._http.get(APIURL+'usuarios/api/usuarios/empresa/find-all');
  }

}
