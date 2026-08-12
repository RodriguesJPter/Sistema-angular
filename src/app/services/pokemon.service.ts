import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, from } from 'rxjs';
import { tap, switchMap, catchError, map, concatMap, toArray } from 'rxjs/operators';
import { Tipo, Geracao, PokemonDetalhado, PokemonTabela } from '../models/pokemon.model';
import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private apiUrl  = 'https://pokeapi.co/api/v2';
  private storageKey = 'pokemon_edicoes';

  private edicoesSubject = new BehaviorSubject<PokemonDetalhado[]>([]);
  public edicoes$ = this.edicoesSubject.asObservable();

  private cache = new Map<string, PokemonDetalhado>();
  private evolutionCache = new Map<string, any>();

  // caches da tabela otimizada
  private listaBase: PokemonTabela[] | null = null;
  private detalheCache = new Map<number, { height: number; tipo: string }>();
  private tipoCache = new Map<string, Set<string>>();


  constructor(private http: HttpClient) {
  this.carregarEdicoesIniciais();
  }

  private carregarEdicoesIniciais(): void {
    const edicoesSalvas = sessionStorage.getItem(this.storageKey);
    if (edicoesSalvas) {
      this.edicoesSubject.next(JSON.parse(edicoesSalvas));
    }
  }

  getTipos(): Observable<{ results: Tipo[] }> {
    return this.http.get<{ results: Tipo[] }>(`${this.apiUrl }/type`);
  }

  getGeracoes(): Observable<{ results: Geracao[] }> {
    return this.http.get<{ results: Geracao[] }>(`${this.apiUrl }/generation`);
  }

  getPokemonsPorGeracao(geracaoId: number): Observable<{ pokemon_species: any[] }> {
    return this.http.get<{ pokemon_species: any[] }>(`${this.apiUrl }/generation/${geracaoId}`);
  }

  getDetalhesPokemon(id: string | number): Observable<PokemonDetalhado> {
    return this.http.get<PokemonDetalhado>(`${this.apiUrl }/pokemon/${id}`);
  }

  getTodosPokemons(limit = 10000): Observable<{ results: { name: string, height: number, tipo: string, url: string }[] }> {
    return this.http.get<{ results: { name: string, height: number, tipo: string, url: string }[] }>(`${this.apiUrl }/pokemon?limit=${limit}`);
  }

  getPokemonsParaTabela(
    pageIndex: number,
    pageSize: number
  ): Observable<{ total: number; data: PokemonTabela[] }> {

    const offset = pageIndex * pageSize;

    return this.http
      .get<{ count: number; results: { name: string; url: string }[] }>(
        `${this.apiUrl}/pokemon?limit=${pageSize}&offset=${offset}`
      )
      .pipe(
        switchMap(response =>
          from(response.results).pipe(
            mergeMap((pokemon, index) => {

              const pokedexNumber = offset + index + 1;

              const pokemonBase: PokemonTabela = {
                pokedex: pokedexNumber,
                nome: pokemon.name,
                height: 0,
                tipo: '',
                geracao: this.determinarGeracao(pokedexNumber),
                sprite: ''
              };

              return this.http.get<any>(pokemon.url).pipe(
                map(details => ({
                  ...pokemonBase,
                  height: details.height,
                  tipo: details.types[0]?.type?.name || '',
                  sprite: details.sprites.front_default || ''
                })),
                catchError(() => of(pokemonBase))
              );

            }, 10),
            toArray(),
            map(data => {
              const ordenado = data.sort((a, b) => a.pokedex - b.pokedex);

              return {
                total: response.count,
                data: ordenado
              };
            })
          )
        )
      );
  }


  // ===== TABELA OTIMIZADA =====

  // Sprite deduzido do id — não precisa de requisição de detalhe
  private spriteUrl(id: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }

  // 1 requisição traz a lista inteira (nome + nº). Cacheada.
  getListaBase(): Observable<PokemonTabela[]> {
    if (this.listaBase) {
      return of(this.listaBase);
    }

    return this.http
      .get<{ results: { name: string; url: string }[] }>(
        `${this.apiUrl}/pokemon?limit=1025&offset=0`
      )
      .pipe(
        map(resp =>
          resp.results.map((p, i) => {
            const pokedex = i + 1;
            return {
              pokedex,
              nome: p.name,
              height: 0,
              tipo: '',
              geracao: this.determinarGeracao(pokedex),
              sprite: this.spriteUrl(pokedex),
              enriquecido: false
            } as PokemonTabela;
          })
        ),
        tap(lista => (this.listaBase = lista))
      );
  }

  // Detalhe (altura + tipo) só quando a linha aparece. Cacheado por id.
  getDetalheTabela(pokedex: number): Observable<{ height: number; tipo: string }> {
    if (this.detalheCache.has(pokedex)) {
      return of(this.detalheCache.get(pokedex)!);
    }

    return this.http.get<any>(`${this.apiUrl}/pokemon/${pokedex}`).pipe(
      map(d => ({
        height: d.height ?? 0,
        tipo: d.types?.[0]?.type?.name || ''
      })),
      tap(v => this.detalheCache.set(pokedex, v)),
      catchError(() => of({ height: 0, tipo: '' }))
    );
  }

  // Nomes de um tipo (1 requisição no /type). Cacheado.
  getNomesPorTipo(tipo: string): Observable<Set<string>> {
    if (this.tipoCache.has(tipo)) {
      return of(this.tipoCache.get(tipo)!);
    }

    return this.http.get<any>(`${this.apiUrl}/type/${tipo}`).pipe(
      map(d => new Set<string>((d.pokemon || []).map((x: any) => x.pokemon.name))),
      tap(s => this.tipoCache.set(tipo, s)),
      catchError(() => of(new Set<string>()))
    );
  }

  private determinarGeracao(id: number): string {
    if (id <= 151) return 'generation-i';
    if (id <= 251) return 'generation-ii';
    if (id <= 386) return 'generation-iii';
    if (id <= 493) return 'generation-iv';
    if (id <= 649) return 'generation-v';
    if (id <= 721) return 'generation-vi';
    if (id <= 809) return 'generation-vii';
    if (id <= 905) return 'generation-viii';
    return 'generation-ix';
  }

getPokemonComEdicoes(id: number): Observable<PokemonDetalhado | null> {

    const chave = id.toString();

    if (this.cache.has(chave)) {
      return of(this.cache.get(chave)!);
    }

    const edicoesSalvas = this.getEdicoesSalvas();
    const edicao = edicoesSalvas.find(p => p.id === id);

    if (edicao) {
      this.cache.set(chave, edicao);
      return of(edicao);
    }

    return this.http
      .get<PokemonDetalhado>(`${this.apiUrl}/pokemon/${id}`)
      .pipe(
        tap(pokemon => this.cache.set(chave, pokemon)),
        catchError(() => of(null))
      );
}


getEdicoesSalvas(): PokemonDetalhado[] {
  const dados = sessionStorage.getItem(this.storageKey);
  return dados ? JSON.parse(dados) : [];
}

salvarEdicao(pokemon: PokemonDetalhado): void {

  const pokemonOtimizado: PokemonDetalhado = {
    id: pokemon.id,
    name: pokemon.name,
    height: pokemon.height,
    weight: pokemon.weight,
    sprites: pokemon.sprites,
    types: pokemon.types,
    base_experience: pokemon.base_experience,
    stats: pokemon.stats,
    abilities: pokemon.abilities,
    species: pokemon.species,
    order: pokemon.order
  };

  const edicoesAtuais = this.getEdicoesSalvas();
  const index = edicoesAtuais.findIndex(p => p.id === pokemon.id);

  if (index >= 0) {
    edicoesAtuais[index] = pokemonOtimizado;
  } else {
    edicoesAtuais.push(pokemonOtimizado);
  }
  sessionStorage.setItem(this.storageKey, JSON.stringify(edicoesAtuais));
  this.edicoesSubject.next(edicoesAtuais);
  
  this.cache.set(pokemon.name.toLowerCase(), pokemonOtimizado);
  this.cache.set(pokemon.id.toString(), pokemonOtimizado);
}

getEvolutionChainFromSpecies(speciesUrl: string): Observable<any> {

  // 🔹 Se já existe no cache → retorna instantâneo
  if (this.evolutionCache.has(speciesUrl)) {
    return of(this.evolutionCache.get(speciesUrl));
  }

  // 🔹 Caso contrário → busca e salva
  return this.http.get<any>(speciesUrl).pipe(
    switchMap(species =>
      this.http.get<any>(species.evolution_chain.url)
    ),
    tap(chain => {
      this.evolutionCache.set(speciesUrl, chain);
    }),
    catchError(() => of(null))
  );
}

}
