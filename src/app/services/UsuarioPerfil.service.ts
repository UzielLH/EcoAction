import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { constApi } from '../envirioments/constApi';

const APIURL = constApi.APIURL; // Asegúrate de importar constApi desde tu entorno

@Injectable({
  providedIn: 'root'
})
export class UsuarioPerfilService {
  private _http = inject(HttpClient);

  constructor() { }
  
  getUuidByUsername(username: string): Observable<any> {
    return this._http.get(`${APIURL}usuarios/api/usuarios/usuario/find-uuid-by-username?username=${username}`);
  }
  
  getUsuarioByUuid(uuidKeycloak: string): Observable<any> {
    return this._http.get(`${APIURL}usuarios/api/usuarios/usuario/find-by-uuid-keycloak?uuidKeycloak=${uuidKeycloak}`);
  }
  
  getEmpresaByUuid(uuidKeycloak: string): Observable<any> {
    return this._http.get(`${APIURL}usuarios/api/usuarios/empresa/find-by-uuid-keycloak?uuidKeycloak=${uuidKeycloak}`);
  }
  
  // Método para actualizar datos de usuario - CORREGIDO
  updateUsuario(usuario: any): Observable<any> {
    // Usar el endpoint de Keycloak que actualiza tanto en Keycloak como en la base de datos
    const uuidKeycloak = usuario.uuidKeycloak || localStorage.getItem('userUuid');
    
    if (!uuidKeycloak) {
      throw new Error('UUID de Keycloak no encontrado');
    }
    
    // Preparar los datos sin el UUID (ya que va en la URL)
    const { uuidKeycloak: _, id, ...userData } = usuario;
    
    return this._http.put(`${APIURL}usuarioskeycloak/api/keycloak/user/update?id=${uuidKeycloak}`, userData);
  }
  
  // Método para actualizar datos de empresa - CORREGIDO
  updateEmpresa(empresa: any): Observable<any> {
    // Usar el endpoint de Keycloak que actualiza tanto en Keycloak como en la base de datos
    const uuidKeycloak = empresa.uuidKeycloak || localStorage.getItem('userUuid');
    
    if (!uuidKeycloak) {
      throw new Error('UUID de Keycloak no encontrado');
    }
    
    // Preparar los datos sin el UUID (ya que va en la URL)
    const { uuidKeycloak: _, id, ...empresaData } = empresa;
    
    return this._http.put(`${APIURL}usuarioskeycloak/api/keycloak/empresa/actualizarEmpresa?id=${uuidKeycloak}`, empresaData);
  }
  
  // Método alternativo usando el endpoint directo de la base de datos (si prefieres este)
  updateUsuarioDirecto(usuario: any): Observable<any> {
    // Este método actualiza directamente en la base de datos
    // Incluye el uuidKeycloak en el cuerpo de la petición
    return this._http.put(`${APIURL}usuarios/api/usuarios/usuario/update`, usuario);
  }
  
  // Método alternativo usando el endpoint directo de la base de datos (si prefieres este)
  updateEmpresaDirecto(empresa: any): Observable<any> {
    // Este método actualiza directamente en la base de datos
    // Incluye el uuidKeycloak en el cuerpo de la petición
    return this._http.put(`${APIURL}usuarios/api/usuarios/empresa/update`, empresa);
  }
  
  // Método para cuando tengas el endpoint correcto de imagen
  getEmpresaImageUrl(empresaId: string): string {
    // Ajustado según el endpoint del Postman
    return `${APIURL}usuarios/api/usuarios/empresa/${empresaId}/imagen`;
  }
  
  // Método alternativo si la imagen viene en los datos de la empresa
  processImageData(imageData: any): string | null {
    if (!imageData) return null;
    
    // Si es base64
    if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
      return imageData;
    }
    
    // Si es una URL completa
    if (typeof imageData === 'string' && (imageData.startsWith('http') || imageData.startsWith('/'))) {
      return imageData.startsWith('http') ? imageData : `${APIURL}${imageData}`;
    }
    
    return null;
  }
}