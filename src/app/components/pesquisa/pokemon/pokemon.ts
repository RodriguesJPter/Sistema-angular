import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { PokemonService } from '../../../services/pokemon.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { PokemonTabela } from '../../../models/pokemon.model';
import { PokedexLista } from '../../pokedex/pokedex-lista/pokedex-lista';
import { PokemonStatus } from '../../status/pokemon-status/pokemon-status';
import { PageEvent } from '@angular/material/paginator';
import { finalize } from 'rxjs/operators';



@Component({
  selector: 'app-pokemon',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    PokedexLista,
    PokemonStatus
  ],
  templateUrl: './pokemon.html',
  styleUrls: ['./pokemon.scss'],
  providers: [PokemonService],
  animations: [
    trigger('menuAnim', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateY(-10px)',
        display: 'none'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateY(0)',
        display: 'flex'
      })),
      transition('hidden <=> visible', [
        animate('200ms ease')
      ])
    ])
  ]
})
export class Pokemon implements OnInit {
  pageIndex: number = 0;
  pageSize: number = 10; 
  totalRegistros: number = 0;

  public logo = 'assets/imagens/Pokemon_logo.png';
  public filtroNome: string = '';
  public filtroTipo: string = '';
  public filtroGeracao: string = '';

  public tipos: { name: string }[] = [];
  public geracoes: { name: string; url: string }[] = [];
  public dataSource = new MatTableDataSource<PokemonTabela>();

  public isLoading: boolean = true;

  public todosPokemons: PokemonTabela[] = [];
  public pokemonsFiltrados: PokemonTabela[] = [];


  public atualizarWidget = 0;
  public widgetPosicao = { top: 200, left: 200 };
  public widgetMenuAberto = false;

  public totalSlots = 6;

  public widgetsAtivos: { tipo: 'pokedex' | 'status'; posicao: number }[] = [];

  public displayedColumns: string[] = [
    'ordem', 'pokedex', 'nome', 'height', 'tipo', 'geracao', 'acoes'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private pokemonService: PokemonService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarFiltros();
    this.carregarPokemons();
    this.carregarWidget();
    this.carregarWidgetsAtivos();
  }

  private carregarFiltros(): void {
    this.pokemonService.getTipos().subscribe({
      next: tipos => {
        this.tipos = tipos.results;
        this.cdr.detectChanges();
      },
      error: err => console.error('Erro ao carregar tipos', err)
    });

    this.pokemonService.getGeracoes().subscribe({
      next: geracoes => this.geracoes = geracoes.results,
      error: err => console.error('Erro ao carregar gerações', err)
    });
  }

  carregarPokemons(): void {
    this.isLoading = true;

    this.pokemonService
      .getPokemonsParaTabela(0, 10000)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges(); 
        })
      )
      .subscribe({
        next: response => {
          this.todosPokemons = response.data;
          this.pokemonsFiltrados = response.data;
          this.totalRegistros = response.data.length;

          this.atualizarPagina();
        },
        error: err => {
          console.error('Erro ao carregar:', err);
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.atualizarPagina();
  }

  filtrar(): void {
    this.pageIndex = 0;

    const nomeFiltro = this.filtroNome.toLowerCase().trim();
    const tipoFiltro = this.filtroTipo.toLowerCase().trim();
    const geracaoFiltro = this.filtroGeracao.toLowerCase().trim();

    this.pokemonsFiltrados = this.todosPokemons.filter(pokemon => {
      const nomeMatch = !nomeFiltro || pokemon.nome.toLowerCase().includes(nomeFiltro);
      const tipoMatch = !tipoFiltro || pokemon.tipo.toLowerCase().includes(tipoFiltro);
      const geracaoMatch = !geracaoFiltro || pokemon.geracao.toLowerCase() === geracaoFiltro;
      return nomeMatch && tipoMatch && geracaoMatch;
    });

    this.totalRegistros = this.pokemonsFiltrados.length;

    this.atualizarPagina();
  }


  private aplicarFiltros(): void {
    const nomeFiltro = this.filtroNome.toLowerCase().trim();
    const tipoFiltro = this.filtroTipo.toLowerCase().trim();
    const geracaoFiltro = this.filtroGeracao.toLowerCase().trim();

    const filtrados = this.todosPokemons.filter(pokemon => {
      const nomeMatch = !this.filtroNome || pokemon.nome.toLowerCase().includes(nomeFiltro);
      const tipoMatch = !this.filtroTipo || pokemon.tipo.toLowerCase().includes(tipoFiltro);
      const geracaoMatch = !this.filtroGeracao || pokemon.geracao.toLowerCase() === geracaoFiltro;
      return nomeMatch && tipoMatch && geracaoMatch;
    });

    this.dataSource.data = filtrados;
    if (this.paginator) this.paginator.firstPage();
  }

  toggleWidgetMenu(): void {
    this.widgetMenuAberto = !this.widgetMenuAberto;
  }

  ativarWidget(tipo: 'pokedex' | 'status'): void {
    const jaExiste = this.widgetsAtivos.find(w => w.tipo === tipo);

    if (jaExiste) {
      this.widgetsAtivos = this.widgetsAtivos.filter(w => w.tipo !== tipo);
    } else {
      const slotLivre = this.encontrarSlotDisponivel(tipo);
      if (slotLivre !== -1) {
        this.widgetsAtivos.push({ tipo, posicao: slotLivre });
      } else {
        alert('Sem espaço disponível para este widget.');
        return;
      }
    }

    this.salvarWidgetsAtivos();
  }

  encontrarSlotDisponivel(tipo: 'pokedex' | 'status'): number {
    const tamanho = tipo === 'pokedex' ? 2 : 1;
    const ocupados = this.widgetsAtivos.flatMap(w =>
      w.tipo === 'pokedex' ? [w.posicao, w.posicao + 1] : [w.posicao]
    );

    const totalSlots = 8;
    for (let i = 0; i <= totalSlots - tamanho; i++) {
      const areaOcupada = Array.from({ length: tamanho }, (_, j) => i + j);
      const conflita = areaOcupada.some(s => ocupados.includes(s));
      if (!conflita) return i;
    }

    return -1;
  }

  salvarWidgetsAtivos(): void {
    localStorage.setItem('widgetsAtivos', JSON.stringify(this.widgetsAtivos));
  }

  carregarWidgetsAtivos(): void {
    const data = localStorage.getItem('widgetsAtivos');
    if (data) this.widgetsAtivos = JSON.parse(data);
  }

 calcularPosicao(slotIndex: number): { top: number; left: number } {
    const larguraSlot = 160;
    const alturaSlot = 130;

    const col = slotIndex % 3; 
    const row = Math.floor(slotIndex / 3); 

   
    const isLadoEsquerdo = slotIndex < 3;

    return {
      top: 400 + row * alturaSlot,
      left: isLadoEsquerdo ? 40 + col * larguraSlot : 1080 - 3 * larguraSlot + col * larguraSlot
    };
  }


  salvarPosicao(): void {
    localStorage.setItem('widgetPosicao', JSON.stringify(this.widgetPosicao));
  }

  carregarWidget(): void {
    const pos = localStorage.getItem('widgetPosicao');
    if (pos) this.widgetPosicao = JSON.parse(pos);
  }

  adicionarFavorito(pokemon: any): void {
    const favs = localStorage.getItem('pokemonsFavoritos');
    const favoritos = favs ? JSON.parse(favs) : [];

    const jaExiste = favoritos.find((p: any) => p.name === pokemon.nome);

    if (!jaExiste) {
      if (favoritos.length >= 6) {
        alert('Você já tem 6 pokémons na sua equipe!');
        return;
      }
      favoritos.push({ name: pokemon.nome, sprite: pokemon.sprite, tipo: pokemon.tipo });
    } else {
      const index = favoritos.findIndex((p: any) => p.name === pokemon.nome);
      favoritos.splice(index, 1);
    }

    localStorage.setItem('pokemonsFavoritos', JSON.stringify(favoritos));
    this.atualizarWidget++;
    this.cdr.detectChanges();
  }

  removerFavorito(index: number): void {
  }

  isFavorito(pokemon: any): boolean {
    const favs = localStorage.getItem('pokemonsFavoritos');
    if (!favs) return false;
    const favoritos = JSON.parse(favs);
    return favoritos.some((p: any) => p.name === pokemon.nome);
  }

  irParaInfo(id: number): void {
    this.pokemonService.getPokemonComEdicoes(id).subscribe({
      next: (data) => {
        if (data) {
          sessionStorage.setItem('pokemon_detalhe_temp', JSON.stringify(data));
          this.router.navigate(['/pokemoninfo', id]);
        }
      },
      error: err => console.error('Erro ao buscar detalhes', err)
    });
  }

  isWidgetAtivo(tipo: 'pokedex' | 'status'): boolean {
      return this.widgetsAtivos.some(w => w.tipo === tipo);
    }

    get slots(): number[] {
    return Array.from({ length: this.totalSlots }, (_, i) => i);
  }

  getSlotPosicao(i: number): { top: string, left: string } {
    const col = i % 3; 
    const row = Math.floor(i / 3);
    return {
      top: `${300 + row * 140}px`,
      left: `${100 + col * 180}px`  
    };
  }

  incrementarAtualizarWidget(): void {
    this.atualizarWidget++;
  }

  private atualizarPagina(): void {
    const inicio = this.pageIndex * this.pageSize;
    const fim = inicio + this.pageSize;

    this.dataSource.data = this.pokemonsFiltrados.slice(inicio, fim);
  }
}
