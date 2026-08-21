import { Component, HostListener, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro.html',
  styleUrls: ['./intro.scss']
})
export class Intro implements OnInit {

  px = 0;
  py = 0;
  private semMouse = false;

  @Output() avancar = new EventEmitter<void>();

  ngOnInit(): void {
    this.semMouse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }

  @HostListener('window:mousemove', ['$event'])
  onMove(e: MouseEvent): void {
    if (this.semMouse) return;
    this.px = (e.clientX / window.innerWidth - 0.5) * 2;
    this.py = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  start(): void {
    this.avancar.emit();
  }
}
