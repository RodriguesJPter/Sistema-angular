import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MetaballsComponent } from '../../metaballs/metaballs';
import { MusicPlayerComponent } from '../../music-player/music-player';
import { MusicService } from '../../../services/music.service';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-menu-principal',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MetaballsComponent,
    MusicPlayerComponent
  ],
  templateUrl: './menu-principal.html',
  styleUrl: './menu-principal.scss'
})
export class MenuPrincipal implements OnInit, OnDestroy {

  menuAberto = false;
  animando = false;
  menuTotalmenteAberto = false;

  menuEscuro = false;

  bloodMoon = false;
  private sub?: Subscription;
  private routerSub?: Subscription;

  menuVisivel = false;

  dripTargets = [
    { x: 21, y: -12, size: 2.1 },
    { x: 9,  y: -19, size: 1.9 },
    { x: -7, y: -21, size: 2.0 }
  ];

   constructor(
    private router: Router,
    private music: MusicService,
    private theme: ThemeService
   ) {}

  ngOnInit(): void {
    this.sub = this.theme.bloodMoon$.subscribe(v => (this.bloodMoon = v));

    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => setTimeout(() => this.onViewportChange(), 80));

    setTimeout(() => this.onViewportChange(), 80);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }

  get metaballColor(): string {
    if (this.bloodMoon) return '#3a1413';
    return this.menuEscuro ? '#0C120A' : '#1A2517';
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange() {

    const dark = document.querySelector('.dark-section');
    this.menuEscuro = !!dark && dark.getBoundingClientRect().top <= 80;

    const intro = document.querySelector('.intro');
    this.menuVisivel = !intro || intro.getBoundingClientRect().bottom <= window.innerHeight * 0.45;
  }

  toggleMenu() {

    if (this.animando) return;

    this.animando = true;
    this.menuAberto = !this.menuAberto;
  }

  onTransitionEnd(event: TransitionEvent) {

    if (event.propertyName !== 'transform') return;

    this.animando = false;

    if (this.menuAberto) {
      this.menuTotalmenteAberto = true;

      this.music.pause();
    }
    else {
      this.menuTotalmenteAberto = false;

      this.music.resume();
    }
  }
  irParaPokemon(event: Event) {
    event.stopPropagation();
    this.router.navigate(['/pokemon']);
  }

  irParaHome(event: Event) {
    event.stopPropagation();
    this.router.navigate(['/home']);
  }
}
