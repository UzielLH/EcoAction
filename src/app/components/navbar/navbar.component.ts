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
  userRole: 'admin' | 'empresa' | 'user' = 'admin'; // Se Cambia segun el rol del usuario

   // Método para verificar si el rol tiene acceso a una sección
   showLink(role: 'admin' | 'empresa' | 'user', link: string): boolean {
    const roleAccess: { [key in 'admin' | 'empresa' | 'user']: string[] } = {
      'admin': ['mapa', 'metas', 'informacion', 'tips', 'colocacionPuntos', 'creacionMetas'],
      'empresa': ['mapa', 'metas', 'informacion', 'tips', 'colocacionPuntos'],
      'user': ['mapa', 'metas', 'informacion', 'tips']
    };

    return roleAccess[role]?.includes(link) ?? false;
  }
}
