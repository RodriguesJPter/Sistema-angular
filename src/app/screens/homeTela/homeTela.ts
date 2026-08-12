import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Angel3dComponent } from '../../components/angel3d/angel3d';
import { TargetCursorComponent } from '../../components/target-cursor/target-cursor';
import { SkillsPc } from '../../components/skills-pc/skills-pc';
import { Intro } from '../../components/intro/intro';


@Component({
  selector: 'app-home-tela',
  standalone: true,
  imports: [
    CommonModule,
    Angel3dComponent,
    TargetCursorComponent,
    SkillsPc,
    Intro
  ],
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