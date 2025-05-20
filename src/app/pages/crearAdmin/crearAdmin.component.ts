import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-crear-admin',
  imports: [],
  templateUrl: './crearAdmin.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearAdminComponent { }
