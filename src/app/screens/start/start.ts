import { Component, ViewChild, OnInit  } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CoinComponent } from '../../components/coin/coin';
import { MusicService } from '../../services/music.service';
import { CoinSlotComponent } from '../../components/coin-slot/coin-slot';

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [
    CommonModule, 
    CoinComponent, 
    CoinSlotComponent
  ],
  templateUrl: './start.html',
  styleUrls: ['./start.scss']
})
export class Start {

  @ViewChild(CoinComponent, { static: false })
  coin!: CoinComponent;

  isStarting = false;

  constructor(
    private router: Router,
    private music: MusicService
  ) {}
  isCoinReady = false;

  ngOnInit(): void {
    this.music.pause();
  }

  startGame(): void {

    if (!this.coin) return;

    this.isStarting = true;  
    this.coin.startAnimation();
  }

  onCoinReady(): void {
    console.log('moeda pronta');
    this.isCoinReady = true;
  }
}