import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
private audio = new Audio('assets/musics/musica_menu.webm');

private isMuted = false;
private isPausedByMenu = false;

constructor() {
  this.audio.loop = true;
  this.audio.volume = 0.2;

  document.addEventListener('click', () => {
    this.audio.play().catch(() => {});
  }, { once: true });
}

pause(): void {
  this.isPausedByMenu = true;
  this.audio.pause();
}

resume(): void {
  this.isPausedByMenu = false;
  this.audio.play().catch(() => {});
}

toggleMute(): void {
  this.isMuted = !this.isMuted;
  this.audio.muted = this.isMuted;
}

setVolume(value: number): void {
  this.audio.volume = value;
}

getVolume(): number {
  return this.audio.volume;
}

getMuted(): boolean {
  return this.isMuted;
}

}