import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
  userRole: string = 'admin'; // Se Cambia segun el rol del usuario user, empresa, admin

   // Método para verificar si el rol tiene acceso a una sección
   showLink(role: string, link: string): boolean {
    const roleAccess: { [key: string]: string[] } = {
      'admin': ['home','mapa', 'metas', 'informacion', 'tips', 'colocacionPuntos', 'creacionMetas'],
      'empresa': ['home','mapa', 'metas', 'informacion', 'tips', 'colocacionPuntos'],
      'user': ['home','mapa', 'metas', 'informacion', 'tips']
    };
     // Si el rol no existe o no está definido, mostrar los enlaces de 'user'
    if (!roleAccess[role]) {
      return roleAccess['user'].includes(link);
    }
    return roleAccess[role].includes(link);
  }
}