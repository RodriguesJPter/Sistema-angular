import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MusicService } from '../../services/music.service';

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro.html',
  styleUrls: ['./intro.scss']
})
export class Intro implements OnInit, OnDestroy {

  px = 0;
  py = 0;

  constructor(private music: MusicService) {}

  ngOnInit(): void {

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

    this.music.resume();
    document.body.style.overflow = '';
    const intro = document.querySelector('.intro') as HTMLElement | null;
    const top = intro ? intro.offsetHeight : window.innerHeight;
    requestAnimationFrame(() =>
      window.scrollTo({ top, behavior: 'smooth' })
    );
  }
}
