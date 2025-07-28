import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators,FormsModule } from '@angular/forms';
import { PokemonService } from '../../../services/pokemon.service'; 
import { catchError, finalize, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { trigger, transition, animate, style, state, AnimationTriggerMetadata } from '@angular/animations';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-pokemoninfo',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatTooltipModule 
  ],
  templateUrl: './pokemoninfo.html',
  styleUrls: ['./pokemoninfo.scss'],
    animations: [
    trigger('fadeButtons', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ]),
    trigger('fadeInputs', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-5px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-5px)' }))
      ])
    ]),
      trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-100%) translateX(-50%)', opacity: 0 }),
        animate('500ms ease-out', 
          style({ transform: 'translateX(-50%)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('500ms ease-in', 
          style({ transform: 'translateX(100%) translateX(-50%)', opacity: 0 }))
      ])
    ]),
    trigger('evolutionFlash', [
      transition('* => *', [
        animate('1500ms ease-in-out', 
          style({ backgroundColor: 'rgba(173, 216, 230, 0.8)' }))
      ])
    ])
  ]
  
})

export class Pokemoninfo implements OnInit {
  ativar3D = false;
  transformStyle = '';
  pokemonOriginal: any = null; // Dados originais da API
  pokemonEditado: any = null;  // Cópia para edição
  modoEdicao = false;
  isLoading = true;
  errorMessage: string | null = null;
  mensagemSemEvolucao: string | null = null;
  isEvolving = false;

  private storageKey = 'pokemon_edicoes';

  constructor(
    private route: ActivatedRoute,
    private pokemonService: PokemonService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const dadosTemp = sessionStorage.getItem('pokemon_detalhe_temp');
    if (dadosTemp) {
      const parsed = JSON.parse(dadosTemp);
      this.carregarDados(parsed);
      sessionStorage.removeItem('pokemon_detalhe_temp');
    } else {
      this.mostrarErro('Nenhum dado encontrado');
    }
  }

  private carregarPokemon(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    
    const dadosLocais = this.obterDadosLocais(id);
    if (dadosLocais) {
      this.carregarDados(dadosLocais);
      return;
    }

    
    this.pokemonService.getDetalhesPokemon(id).pipe(
      tap(() => console.log('Buscando dados da API...')),
      catchError(error => {
        this.mostrarErro('Erro ao carregar dados da API');
        console.error('Erro na API:', error);
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
        console.log('Carregamento finalizado');
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          this.carregarDados(data);
          this.salvarDadosLocais(data); 
        } else {
          this.mostrarErro('Pokémon não encontrado');
        }
      }
    });
  }

  private carregarDados(dados: any): void {
    this.pokemonOriginal = dados;
    this.pokemonEditado = JSON.parse(JSON.stringify(dados)); 
    this.isLoading = false;
  }

  private obterDadosLocais(id: string): any {
    const edicoesSalvas = sessionStorage.getItem(this.storageKey);
    if (!edicoesSalvas) return null;

    try {
      const dados = JSON.parse(edicoesSalvas);
      return dados.find((p: any) => p.id === parseInt(id));
    } catch (e) {
      console.error('Erro ao ler sessionStorage:', e);
      return null;
    }
  }

  private salvarDadosLocais(dados: any): void {
    let edicoesSalvas = [];
    const dadosExistentes = sessionStorage.getItem(this.storageKey);
    
    if (dadosExistentes) {
      edicoesSalvas = JSON.parse(dadosExistentes);
      edicoesSalvas = edicoesSalvas.filter((p: any) => p.id !== dados.id);
    }
    
    edicoesSalvas.push(dados);
    sessionStorage.setItem(this.storageKey, JSON.stringify(edicoesSalvas));
  }

  entrarModoEdicao(): void {
    this.modoEdicao = true;
  }

  salvarEdicoes(): void {
    this.pokemonOriginal = { ...this.pokemonEditado };
    this.salvarDadosLocais(this.pokemonOriginal);
    this.modoEdicao = false;
  }

  cancelarEdicao(): void {
    this.pokemonEditado = JSON.parse(JSON.stringify(this.pokemonOriginal));
    this.modoEdicao = false;
  }

  voltarParaLista(): void {
    this.router.navigate(['/pokemon']);
  }

 onMouseMove(event: MouseEvent, card: HTMLElement): void {
    if (!this.ativar3D) {
      this.transformStyle = '';
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest('.btn-toggle-3d')) {
      this.transformStyle = '';
      return;
    }

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    this.transformStyle = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  onMouseLeave(): void {
    this.transformStyle = '';
  }

 private mostrarErro(mensagem: string): void {
    this.errorMessage = mensagem;
    this.isLoading = false;
    console.error(mensagem);
    
    setTimeout(() => {
      this.errorMessage = null;
    }, 5000);
  }

mostrarProximaEvolucao() {
  if (!this.pokemonEditado || !this.pokemonEditado.species?.url) return;

  this.pokemonService.getEvolutionChainFromSpecies(this.pokemonEditado.species.url).subscribe(chain => {
    let current = chain.chain;
    let found = false;

    while (current) {
      if (current.species.name === this.pokemonEditado.name) {
        found = true;
        break;
      }
      current = current.evolves_to[0];
    }

    if (found && current.evolves_to.length > 0) {
      const nextEvolutionName = current.evolves_to[0].species.name;
      this.pokemonService.getDetalhesPokemon(nextEvolutionName).subscribe(nextEvo => {
        this.pokemonEditado = nextEvo;
        this.mensagemSemEvolucao = null;
      });
    } else {
      this.mensagemSemEvolucao = "Este Pokémon não possui mais evoluções!";

      // Faz a mensagem sumir após 3 segundos
      setTimeout(() => {
        this.mensagemSemEvolucao = null;
      }, 3000);
    }
  });
}


}
