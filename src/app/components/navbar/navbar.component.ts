import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { itemNavbar } from '../../interfaces/interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styles: ''
})
export class NavbarComponent {
  isMenuOpen: boolean = false;
  isLoggedIn: boolean = false;
  username:string='';
  private router = inject(Router);

  // userRole: string = 'admin';
  userRole: string = localStorage.getItem('rol') || 'user-realm-rol'; // Obtener el rol del localStorage o asignar 'user' por defecto	
  
  ngOnInit(): void {
    // Detecta si el usuario está logueado al cargar el componente
    this.isLoggedIn = !!localStorage.getItem('rol'); // Si existe un rol, está logueado

    // Obtiene el nombre del usuario desde localStorage
    const storedUsername = localStorage.getItem('username');
    this.username = storedUsername ? storedUsername : ''; // Si no hay username, asigna una cadena vacía
  }

   // Método para verificar si el rol tiene acceso a una sección
   showLink(role: string, link: string): boolean {
    const roleAccess: { [key: string]: string[] } = {
      'admin-realm-rol': ['home','mapa', 'metas', 'informacion', 'tips', 'colocacionPuntos', 'creacionMetas'],
      'empresa-realm-rol': ['home','mapa', 'metas', 'informacion', 'tips', 'colocacionPuntos'],
      'user-realm-rol': ['home','mapa', 'metas', 'informacion', 'tips']
    };
     // Si el rol no existe o no está definido, mostrar los enlaces de 'user'
    if (!roleAccess[role]) {
      return roleAccess['user'].includes(link);
    }
    return roleAccess[role].includes(link);
  }

  logout(): void {
    this.isLoggedIn = false;
    localStorage.removeItem('rol'); // Limpia el rol del localStorage
    this.router.navigate(['/home']); // Redirigir al dashboard o página principal
  }
}