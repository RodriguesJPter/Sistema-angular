import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro.html',
  styleUrls: ['./intro.scss']
})
export class Intro implements OnInit, OnDestroy {

  // posição do mouse normalizada (-1 a 1) para o parallax
  px = 0;
  py = 0;

  ngOnInit(): void {
    // trava o scroll até clicar em START GAME
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  @HostListener('window:mousemove', ['$event'])
  onMove(e: MouseEvent): void {
    this.px = (e.clientX / window.innerWidth - 0.5) * 2;
    this.py = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  start(): void {
    // libera o scroll e desce para o conteúdo
    document.body.style.overflow = '';
    const intro = document.querySelector('.intro') as HTMLElement | null;
    const top = intro ? intro.offsetHeight : window.innerHeight;
    requestAnimationFrame(() =>
      window.scrollTo({ top, behavior: 'smooth' })
    );
  }
}
