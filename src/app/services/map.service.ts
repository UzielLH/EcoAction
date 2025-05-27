import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

const APIURL='http://175.1.32.17:8081/';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private _http=inject(HttpClient);

  constructor() { }
  getRecicladoras(){
    return this._http.get(APIURL+'api/usuarios/empresa/find-all');
  }

}
