import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-historial-todo',
  imports: [],
  templateUrl: './historialTodo.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistorialTodoComponent { }
