import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerfilRpg } from '../perfil-rpg/perfil-rpg';
import { ContatoTerminal } from '../contato-terminal/contato-terminal';
import { GameFps } from '../game-fps/game-fps';

interface Tech {
  name: string;
  desc: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  fileIcon: string;
  techs: Tech[];
}

interface Win {
  id: string;
  kind: 'folder' | 'note' | 'about' | 'perfil' | 'contato' | 'game';
  title: string;
  icon: string;
  x: number;
  y: number;
  z: number;
  cat?: Category;
  tech?: Tech;
}

@Component({
  selector: 'app-skills-pc',
  standalone: true,
  imports: [CommonModule, PerfilRpg, ContatoTerminal, GameFps],
  templateUrl: './skills-pc.html',
  styleUrls: ['./skills-pc.scss']
})
export class SkillsPc implements AfterViewInit, OnDestroy {

  @ViewChild('root', { static: true }) root!: ElementRef<HTMLElement>;
  @ViewChild('screen', { static: true }) screen!: ElementRef<HTMLElement>;

  booting = false;
  powered = false;
  bootProgress = 0;
  startOpen = false;
  clock = '00:00';
  crtLigado = true;

  categories: Category[] = [
    {
      id: 'front', name: 'Frontend', icon: 'web', fileIcon: 'code',
      techs: [
        { name: 'Angular', desc: 'Tenho experiência prática no desenvolvimento de aplicações web utilizando Angular, trabalhando na criação de componentes, telas, serviços, rotas, formulários e integração com APIs REST. Também trabalhei com autenticação utilizando Keycloak, componentes do Angular Material, tratamento de dados assíncronos e organização da aplicação por funcionalidades.' },
        { name: 'TypeScript', desc: 'Utilizo TypeScript no desenvolvimento de aplicações Angular e React Native, trabalhando com tipagem de dados, interfaces, classes, enums, serviços e organização de modelos utilizados na comunicação com APIs. Tenho experiência com tipagem de respostas HTTP e estruturação de objetos utilizados pela aplicação.' },
        { name: 'JavaScript', desc: 'Possuo conhecimento e experiência prática com JavaScript aplicado ao desenvolvimento frontend e mobile. Utilizo conceitos da linguagem para manipulação de dados, funções, objetos, arrays, programação assíncrona e integração com diferentes bibliotecas e frameworks.' },
        { name: 'HTML5', desc: 'Tenho experiência na construção de interfaces utilizando HTML5, estruturando páginas e componentes de acordo com suas responsabilidades e necessidades da aplicação. Trabalho com formulários, inputs, elementos semânticos e integração com componentes do Angular.' },
        { name: 'CSS3', desc: 'Tenho experiência na estilização e construção de interfaces utilizando CSS3, trabalhando com layouts, responsividade, posicionamento, animações, transições e personalização visual dos componentes. Também já trabalhei com interfaces mais personalizadas, indo além da utilização de componentes prontos.' },
        { name: 'Angular Material', desc: 'Tenho experiência utilizando Angular Material para construção de interfaces, trabalhando com componentes como tabelas, formulários, botões, diálogos, menus e outros elementos da biblioteca. Também realizei personalizações para adaptar os componentes ao design das aplicações.' },
        { name: 'RxJS', desc: 'Utilizo RxJS principalmente dentro do ecossistema Angular para trabalhar com operações assíncronas e observables. Tenho experiência com o tratamento de respostas de APIs, transformação de dados e gerenciamento do fluxo de informações entre serviços e componentes.' },
        { name: 'APIs REST', desc: 'Tenho experiência integrando aplicações frontend e mobile com APIs REST, realizando operações como GET, POST, PUT e outras requisições HTTP. Também trabalhei com tratamento de respostas, erros, paginação, autenticação por token e envio de dados para o backend.' }
      ]
    },
    {
      id: 'mobile', name: 'Mobile', icon: 'smartphone', fileIcon: 'phone_iphone',
      techs: [
        { name: 'React Native', desc: 'Tenho experiência prática no desenvolvimento de aplicações mobile utilizando React Native, criando telas, componentes reutilizáveis, navegação e integração com APIs. Trabalhei também com fluxos de autenticação, armazenamento de tokens, validações e funcionalidades específicas para dispositivos móveis.' },
        { name: 'Expo', desc: 'Utilizei Expo como ambiente de desenvolvimento para aplicações React Native, trabalhando com execução do projeto, integração de recursos nativos e desenvolvimento durante as etapas de construção e testes da aplicação mobile.' },
        { name: 'React Native Paper', desc: 'Utilizei React Native Paper para construção da interface das aplicações mobile, trabalhando com componentes como botões, inputs, modais e outros elementos de UI, além de realizar adaptações conforme a necessidade do projeto.' },
        { name: 'WebView', desc: 'Tenho experiência utilizando WebView em aplicações React Native para incorporar conteúdos web dentro da aplicação mobile e realizar a integração entre a aplicação nativa e páginas web.' },
        { name: 'AsyncStorage', desc: 'Utilizei AsyncStorage em aplicações React Native para armazenamento local de informações que precisam permanecer disponíveis entre diferentes sessões da aplicação.' },
        { name: 'SecureStore', desc: 'Tenho experiência utilizando SecureStore para armazenamento de informações sensíveis no ambiente mobile, principalmente dados relacionados ao processo de autenticação, como tokens de acesso e refresh tokens.' }
      ]
    },
    {
      id: 'back', name: 'Backend', icon: 'dns', fileIcon: 'terminal',
      techs: [
        { name: 'Python', desc: 'Atualmente venho aprofundando meus conhecimentos em Python com foco no desenvolvimento backend. Durante meus estudos, desenvolvi uma API utilizando FastAPI, trabalhando com CRUD, validações, organização em camadas e integração com banco de dados.' },
        { name: 'FastAPI', desc: 'Tenho experiência prática desenvolvendo APIs REST com FastAPI. Criei endpoints para operações de CRUD, utilizei schemas com Pydantic, organizei a aplicação utilizando Router, Service e Repository e realizei testes dos endpoints utilizando Postman.' },
        { name: 'APIs REST', desc: 'Tenho experiência tanto consumindo quanto desenvolvendo APIs REST. No frontend e mobile, trabalhei com integração e consumo de endpoints, enquanto nos estudos de backend desenvolvi APIs próprias utilizando Python e FastAPI.' },
        { name: 'CRUD', desc: 'Tenho experiência implementando operações de CRUD, trabalhando com criação, consulta, atualização e exclusão de dados. Também trabalhei com validações de regras de negócio e tratamento de diferentes respostas HTTP.' },
        { name: 'Pydantic', desc: 'Utilizei Pydantic no desenvolvimento de APIs com FastAPI para criação de schemas, definição da estrutura dos dados e validação das informações recebidas e retornadas pela API.' },
        { name: 'Router / Service / Repository', desc: 'Durante meus estudos de backend, implementei uma estrutura dividindo as responsabilidades da aplicação entre Router, Service e Repository. O Router é responsável pela entrada das requisições, o Service concentra as regras de negócio e o Repository fica responsável pelo acesso e manipulação dos dados.' },
        { name: 'Validação de dados', desc: 'Tenho experiência trabalhando com validações tanto no frontend quanto no backend. Durante meus estudos com FastAPI, passei a concentrar as validações relacionadas às regras de negócio na camada Service, além das validações estruturais realizadas através do Pydantic.' }
      ]
    },
    {
      id: 'db', name: 'Banco de dados', icon: 'storage', fileIcon: 'table_chart',
      techs: [
        { name: 'PostgreSQL', desc: 'Tenho experiência utilizando PostgreSQL em projetos e estudos de backend, trabalhando com a integração entre a API e o banco de dados. Também tive contato com a execução e configuração do PostgreSQL utilizando Docker.' },
        { name: 'SQL', desc: 'Possuo conhecimento em SQL aplicado à utilização de bancos relacionais, compreendendo conceitos de consultas, inserção, atualização e relacionamento entre dados. Estou aprofundando meus conhecimentos à medida que avanço no desenvolvimento backend.' },
        { name: 'Integração app e banco', desc: 'Tenho experiência trabalhando com o fluxo de comunicação entre aplicação, API e banco de dados. Durante meus estudos de backend, venho utilizando PostgreSQL para compreender na prática como os dados são persistidos e recuperados pela aplicação.' }
      ]
    },
    {
      id: 'auth', name: 'Auth e segurança', icon: 'lock', fileIcon: 'vpn_key',
      techs: [
        { name: 'Keycloak', desc: 'Tenho experiência prática utilizando Keycloak como servidor de identidade para autenticação e autorização de aplicações. Trabalhei com configuração de realms, clients, integração com Angular, proteção de rotas e personalização de telas de login, incluindo configuração de temas e integração com SMTP.' },
        { name: 'OAuth 2.0', desc: 'Possuo conhecimento prático dos conceitos de OAuth 2.0 através da utilização do Keycloak, compreendendo o papel do provedor de identidade, clientes, tokens e autorização no acesso aos recursos protegidos.' },
        { name: 'OpenID Connect', desc: 'Tenho conhecimento de OpenID Connect através da integração de aplicações com Keycloak, trabalhando com o protocolo de autenticação baseado em OAuth 2.0 e utilizando informações de identidade fornecidas pelo provedor.' },
        { name: 'JWT', desc: 'Tenho experiência trabalhando com JWT no contexto de autenticação de aplicações web e mobile. Utilizei tokens para manter o estado de autenticação e realizar requisições autenticadas para APIs protegidas.' },
        { name: 'Autenticação e autorização', desc: 'Tenho experiência implementando e integrando mecanismos de autenticação e autorização utilizando Keycloak. Já trabalhei com autenticação em aplicações Angular e React Native, armazenamento seguro de tokens e proteção do acesso às funcionalidades da aplicação.' }
      ]
    }
  ];

  aboutSections: { h: string; p: string }[] = [
    {
      h: 'A ideia',
      p: 'Eu não queria um portfólio que fosse só uma lista de tecnologias. Como sou ' +
         'desenvolvedor, transformei as minhas habilidades num sistema operacional falso ' +
         'dos anos 2000: cada categoria é um ícone que abre uma "pasta" com as ferramentas, ' +
         'e cada ferramenta abre um bloco de notas contando como eu a uso. O tema Y2K conversa ' +
         'com o resto do site (o CD, os metaballs e o verde da marca).'
    },
    {
      h: 'O monitor (CRT)',
      p: 'A moldura do computador é 100% CSS, sem nenhuma imagem: o plástico, a curvatura da ' +
         'tela, as scanlines, o brilho e o pé de apoio são só gradientes e sombras. Isso deixa ' +
         'tudo leve e nítido em qualquer tamanho de tela.'
    },
    {
      h: 'A inicialização',
      p: 'Quando o computador entra na tela durante a rolagem, um IntersectionObserver dispara ' +
         'a animação de boot do "JohnDows 2000" com a barra de progresso, e só então cai na área ' +
         'de trabalho. Dá para reiniciar pelo menu Iniciar.'
    },
    {
      h: 'As janelas',
      p: 'As janelas são arrastáveis (pointer events), têm foco por z-index, e existem barra de ' +
         'tarefas com relógio e menu Iniciar. Tudo é estado dentro do componente Angular, sem ' +
         'nenhuma biblioteca externa de UI.'
    },
    {
      h: 'A logo do sistema',
      p: 'A logo é a minha própria marca. Ela era um PNG, então eu a vetorizei para SVG ' +
         '(contorno e furos internos) para ficar nítida em qualquer escala, com uma versão ' +
         'clara e outra escura conforme o fundo.'
    },
    {
      h: 'O stack',
      p: 'Componente standalone em Angular + TypeScript, estilizado com SCSS e ícones do ' +
         'Material Icons. Nenhum framework de UI retrô pronto — a estética 98/2000 foi feita à mão.'
    }
  ];

  windows: Win[] = [];
  private zTop = 10;

  private io?: IntersectionObserver;
  private booted = false;
  private clockTimer?: ReturnType<typeof setInterval>;

  ngAfterViewInit(): void {
    this.tick();
    this.clockTimer = setInterval(() => this.tick(), 15000);

    this.io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !this.booted) {
          this.booted = true;
          this.boot();
        }
      });
    }, { threshold: 0.35 });

    this.io.observe(this.root.nativeElement);
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
    if (this.clockTimer) clearInterval(this.clockTimer);
  }

  private tick(): void {
    const d = new Date();
    this.clock = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }

  boot(): void {
    this.booting = true;
    this.powered = false;
    this.startOpen = false;
    this.windows = [];
    this.bootProgress = 0;

    const t = setInterval(() => {
      this.bootProgress += Math.random() * 16 + 7;
      if (this.bootProgress >= 100) {
        this.bootProgress = 100;
        clearInterval(t);
        setTimeout(() => {
          this.booting = false;
          this.powered = true;
        }, 550);
      }
    }, 230);
  }

  restart(): void {
    this.startOpen = false;
    this.boot();
  }

  private focus(w: Win): void {
    this.zTop++;
    w.z = this.zTop;
  }

  openFolder(cat: Category): void {
    this.startOpen = false;
    const id = 'f-' + cat.id;
    const found = this.windows.find(w => w.id === id);
    if (found) { this.focus(found); return; }

    const n = this.windows.length;
    this.windows.push({
      id, kind: 'folder', title: cat.name, icon: cat.icon,
      x: 150 + n * 26, y: 24 + n * 22, z: ++this.zTop, cat
    });
  }

  openNote(cat: Category, tech: Tech): void {
    const id = 'n-' + cat.id + '-' + tech.name;
    const found = this.windows.find(w => w.id === id);
    if (found) { this.focus(found); return; }

    const n = this.windows.length;
    this.windows.push({
      id, kind: 'note', title: tech.name + '.txt', icon: 'description',
      x: 210 + n * 24, y: 40 + n * 22, z: ++this.zTop, cat, tech
    });
  }

  openPerfil(): void {
    this.startOpen = false;
    const id = 'perfil';
    const found = this.windows.find(w => w.id === id);
    if (found) { this.focus(found); return; }

    const n = this.windows.length;
    this.windows.push({
      id, kind: 'perfil', title: 'Sobre mim', icon: 'person',
      x: 90 + n * 22, y: 16 + n * 18, z: ++this.zTop
    });
  }

  openContato(): void {
    this.startOpen = false;
    const id = 'contato';
    const found = this.windows.find(w => w.id === id);
    if (found) { this.focus(found); return; }

    const n = this.windows.length;
    this.windows.push({
      id, kind: 'contato', title: 'Contato', icon: 'mail',
      x: 150 + n * 22, y: 30 + n * 18, z: ++this.zTop
    });
  }

  openGame(): void {
    this.startOpen = false;
    const id = 'game';
    const found = this.windows.find(w => w.id === id);
    if (found) { this.focus(found); return; }

    const n = this.windows.length;
    this.windows.push({
      id, kind: 'game', title: 'Game', icon: 'sports_esports',
      x: 110 + n * 20, y: 20 + n * 16, z: ++this.zTop
    });
  }

  toggleCrt(ev?: Event): void {
    ev?.stopPropagation();
    this.crtLigado = !this.crtLigado;
  }

  openAbout(): void {
    this.startOpen = false;
    const id = 'about';
    const found = this.windows.find(w => w.id === id);
    if (found) { this.focus(found); return; }

    const n = this.windows.length;
    this.windows.push({
      id, kind: 'about', title: 'Como foi feito', icon: 'menu_book',
      x: 150 + n * 24, y: 22 + n * 20, z: ++this.zTop
    });
  }

  bringToFront(w: Win): void {
    this.focus(w);
  }

  close(id: string, ev?: Event): void {
    ev?.stopPropagation();
    this.windows = this.windows.filter(w => w.id !== id);
  }

  toggleStart(): void {
    this.startOpen = !this.startOpen;
  }

  private dragWin?: Win;
  private offX = 0;
  private offY = 0;

  startDrag(ev: PointerEvent, w: Win): void {
    if ((ev.target as HTMLElement).closest('.tb-btn')) return;
    this.focus(w);
    const rect = this.screen.nativeElement.getBoundingClientRect();
    this.dragWin = w;
    this.offX = ev.clientX - rect.left - w.x;
    this.offY = ev.clientY - rect.top - w.y;
  }

  @HostListener('document:pointermove', ['$event'])
  onMove(ev: PointerEvent): void {
    if (!this.dragWin) return;
    const rect = this.screen.nativeElement.getBoundingClientRect();
    let nx = ev.clientX - rect.left - this.offX;
    let ny = ev.clientY - rect.top - this.offY;
    nx = Math.max(-60, Math.min(nx, rect.width - 70));
    ny = Math.max(0, Math.min(ny, rect.height - 60));
    this.dragWin.x = nx;
    this.dragWin.y = ny;
  }

  @HostListener('document:pointerup')
  onUp(): void {
    this.dragWin = undefined;
  }

  trackWin = (_: number, w: Win) => w.id;
  trackTech = (_: number, t: Tech) => t.name;
}
