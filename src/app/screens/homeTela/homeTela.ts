import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-tela',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './homeTela.html',
  styleUrls: ['./homeTela.scss']
})
export class HomeTela {

  constructor(private router: Router) {}

  irParaPokemon(): void {
    this.router.navigate(['']);
  }

  irParaFavoritos(): void {
    this.router.navigate(['favoritos']);
  }

}