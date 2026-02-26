import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MusicService } from '../../services/music.service';

@Component({
  selector: 'app-music-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './music-player.html',
  styleUrls: ['./music-player.scss']
})
export class MusicPlayerComponent {

  constructor(public music: MusicService) {}

  toggleMute(): void {
    this.music.toggleMute();
  }

  changeVolume(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    this.music.setVolume(value);
  }

  get volumeIcon(): string {

    if (this.music.getMuted()) {
      return 'assets/icons/volume-mute.svg';
    }

    const volume = this.music.getVolume();

    if (volume === 0) {
      return 'assets/icons/volume-mute.svg';
    }

    if (volume <= 0.5) {
      return 'assets/icons/volume-down-fill.svg';
    }

    return 'assets/icons/volume-up-fill.svg';
  }
}