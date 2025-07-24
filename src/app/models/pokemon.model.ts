export interface Tipo {
  name: string;
  url: string;
}

export interface Geracao {
  name: string;
  url: string;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonSprites {
  front_default: string;
  front_shiny?: string;
  front_female?: string;
  front_shiny_female?: string;
  back_default?: string;
  back_shiny?: string;
  back_female?: string;
  back_shiny_female?: string;
  other: {
    'official-artwork': {
      front_default: string;
      front_shiny?: string;
    };
    dream_world?: {
      front_default: string;
      front_female?: string;
    };
  };
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonDetalhado {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  stats: PokemonStat[];
  sprites: PokemonSprites;
  types: PokemonType[];
  abilities: PokemonAbility[];
  species: {
    name: string;
    url: string;
  };
  order: number;
}

export interface PokemonTabela {
  pokedex: number;
  nome: string;
  height: number;
  tipo: string;
  geracao: string;
  sprite: string;
}