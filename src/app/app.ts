import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
  ],
  template: `
  <div class="main-content">
    <router-outlet></router-outlet>
  </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      padding: 0px;
    }
  `]
})
export class App {}
