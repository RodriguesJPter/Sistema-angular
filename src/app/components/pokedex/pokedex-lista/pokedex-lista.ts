import { Component, Input, Output, EventEmitter, OnInit, HostListener, OnChanges, SimpleChanges} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { trigger, style, transition, animate } from '@angular/animations';


@Component({
  selector: 'app-pokedex-lista',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './pokedex-lista.html',
  styleUrl: './pokedex-lista.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
      ])
    ]),
    trigger('pokemonAppear', [
      transition(':enter', [
        style({ transform: 'scale(0.5) rotate(-30deg)', opacity: 0 }),
        animate('400ms cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
          style({ transform: 'scale(1) rotate(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', 
          style({ transform: 'scale(0.5) rotate(30deg)', opacity: 0 }))
      ])
    ])
  ]
})

export class PokedexLista implements OnInit, OnChanges {
  @Input() posicao = { top: 30, left: 0 };
  @Output() remover = new EventEmitter<number>();
  @Input() atualizarListaTrigger = 0;

  public pokemonsFavoritos: { name: string; sprite: string }[] = [];

  public mensagemNotificacao = '';
  public slots: ({ name: string; sprite: string; tipo: string } | null)[] = [];

  private arrastando = false;
  private offset = { x: 0, y: 0 };

  ngOnInit(): void {
    const favs = localStorage.getItem('pokemonsFavoritos');
    if (favs) this.pokemonsFavoritos = JSON.parse(favs);

    const pos = localStorage.getItem('widgetPosicao');
    if (pos) this.posicao = JSON.parse(pos);
  }

  onMouseDown(event: MouseEvent): void {
    this.arrastando = true;
    this.offset = {
      x: event.clientX - this.posicao.left,
      y: event.clientY - this.posicao.top
    };
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.arrastando) {
      this.posicao.left = event.clientX - this.offset.x;
      this.posicao.top = event.clientY - this.offset.y;
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.arrastando) {
      this.salvarPosicao();
    }
    this.arrastando = false;
  }

  private salvarPosicao(): void {
    localStorage.setItem('widgetPosicao', JSON.stringify(this.posicao));
  }

  removerFavorito(index: number): void {
    this.slots[index] = null; 

    const favs = localStorage.getItem('pokemonsFavoritos');
    const lista = favs ? JSON.parse(favs) : [];

    lista.splice(index, 1); 
    localStorage.setItem('pokemonsFavoritos', JSON.stringify(lista));

    this.carregarFavoritos(); 
    this.remover.emit(index);
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['atualizarListaTrigger']) {
      this.carregarFavoritos();
    }
  }

  private carregarFavoritos(): void {
    const favs = localStorage.getItem('pokemonsFavoritos');
    const lista = favs ? JSON.parse(favs) : [];

    this.slots = Array(6).fill(null);
    lista.slice(0, 6).forEach((p: any, i: number) => this.slots[i] = p);

    const quantidade = lista.length;
    
    if (quantidade === 0) {
      this.mensagemNotificacao = 'Nenhum Pokémon adicionado!';
    } else if (quantidade >= 6) {
      this.mensagemNotificacao = 'Lista cheia (6/6)';
    } else {
      this.mensagemNotificacao = `${quantidade}/6 Pokémon`;
    }

    this.pokemonsFavoritos = lista;
  }

  getTipoClasse(index: number): string {
    return this.slots[index]?.tipo || '';
  }

}
