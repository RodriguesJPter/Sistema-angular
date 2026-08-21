import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef
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
  max?: boolean;
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
      h: 'No celular vira um telefone',
      p: 'É o mesmo componente, mas por media query no celular o computador se transforma ' +
         'num celular touchscreen antigo: a moldura do monitor vira o corpo do telefone (com ' +
         'alto-falante e botão home) e a tela gira para o modo retrato. O desktop vira um "SO" ' +
         'de celular: barra de status no topo (relógio, sinal, wi-fi e bateria), os ícones viram ' +
         'blocos de app numa home screen e some a barra Iniciar. Os apps abrem em tela cheia com ' +
         'um cabeçalho escuro e uma seta de voltar, no lugar da janela arrastável.'
    },
    {
      h: 'O jogo no celular',
      p: 'O game (um raycaster estilo Doom feito à mão em canvas) ganha controles de toque: um ' +
         'direcional para andar, botões de tiro e espada, e arrastar o dedo para virar a câmera. ' +
         'Ele exige o modo paisagem — em pé, aparece um aviso "gire o celular" dentro da própria ' +
         'tela do telefone; deitado, o jogo ocupa a tela inteira com os controles.'
    },
    {
      h: 'O stack',
      p: 'Componente standalone em Angular + TypeScript, estilizado com SCSS e ícones do ' +
         'Material Icons. Nenhum framework de UI retrô pronto, a estética 98/2000 foi feita à mão.'
    }
  ];

  windows: Win[] = [];
  private zTop = 10;

  private io?: IntersectionObserver;
  private booted = false;
  private clockTimer?: ReturnType<typeof setInterval>;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.tick();
    this.clockTimer = setInterval(() => this.tick(), 15000);

    this.io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !this.booted) {
          this.booted = true;
          this.boot();
          this.cdr.markForCheck();
        }
      });
    }, { threshold: 0.25 });

    this.io.observe(this.screen.nativeElement);
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
    if (this.clockTimer) clearInterval(this.clockTimer);
  }

  private tick(): void {
    const d = new Date();
    this.clock = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    this.cdr.markForCheck();
  }

  boot(): void {
    this.booting = true;
    this.powered = false;
    this.startOpen = false;
    this.windows = [];
    this.bootProgress = 0;
    this.cdr.markForCheck();

    const t = setInterval(() => {
      this.bootProgress += Math.random() * 16 + 7;
      if (this.bootProgress >= 100) {
        this.bootProgress = 100;
        clearInterval(t);
        setTimeout(() => {
          this.booting = false;
          this.powered = true;
          this.cdr.markForCheck();
        }, 550);
      }
      this.cdr.markForCheck();
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

  // posição inicial centralizada no monitor (com leve cascata pra várias janelas)
  private centro(n: number, w: number, h: number): { x: number; y: number } {
    // no modo tela cheia, abre em cascata natural (não centraliza)
    if (this.telaCheia) {
      const c = n % 8;
      return { x: 44 + c * 32, y: 30 + c * 30 };
    }
    const el = this.screen?.nativeElement;
    const sw = el ? el.clientWidth : 900;
    const sh = el ? el.clientHeight : 620;
    const casc = (n % 5) * 22;
    const x = Math.round(Math.max(8, Math.min((sw - w) / 2 + casc, sw - 90)));
    // centraliza na área acima da taskbar (32px), com leve viés pra cima
    const y = Math.round(Math.max(8, Math.min((sh - 32 - h) / 2 - 8 + casc, sh - 60)));
    return { x, y };
  }

  openFolder(cat: Category): void {
    this.startOpen = false;
    const id = 'f-' + cat.id;
    const found = this.windows.find(w => w.id === id);
    if (found) { this.focus(found); return; }

    const n = this.windows.length;
    const p = this.centro(n, 230, 300);
    this.windows.push({
      id, kind: 'folder', title: cat.name, icon: cat.icon,
      x: p.x, y: p.y, z: ++this.zTop, max: this.ehMobile(), cat
    });
  }

  openNote(cat: Category, tech: Tech): void {
    const id = 'n-' + cat.id + '-' + tech.name;
    const found = this.windows.find(w => w.id === id);
    if (found) { this.focus(found); return; }

    const n = this.windows.length;
    const p = this.centro(n, 264, 260);
    this.windows.push({
      id, kind: 'note', title: tech.name + '.txt', icon: 'description',
      x: p.x, y: p.y, z: ++this.zTop, max: this.ehMobile(), cat, tech
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
      x: 90 + n * 22, y: 16 + n * 18, z: ++this.zTop, max: this.ehMobile()
    });
  }

  openContato(): void {
    this.startOpen = false;
    const id = 'contato';
    const found = this.windows.find(w => w.id === id);
    if (found) { this.focus(found); return; }

    const n = this.windows.length;
    const p = this.centro(n, 470, 430);
    this.windows.push({
      id, kind: 'contato', title: 'Contato', icon: 'mail',
      x: p.x, y: p.y, z: ++this.zTop, max: this.ehMobile()
    });
  }

  openGame(): void {
    this.startOpen = false;
    const id = 'game';
    const found = this.windows.find(w => w.id === id);
    if (found) { this.focus(found); return; }

    const n = this.windows.length;
    const p = this.centro(n, 470, 320);
    this.windows.push({
      id, kind: 'game', title: 'Game', icon: 'sports_esports',
      x: p.x, y: p.y, z: ++this.zTop, max: this.ehMobile()
    });
  }

  toggleCrt(ev?: Event): void {
    ev?.stopPropagation();
    this.crtLigado = !this.crtLigado;
  }

  telaCheia = false;
  fechando = false;
  crtH = 0;
  ml = 0;
  mt = 0;
  efx = 0.4;
  efy = 0.5;
  private scrollAntes = 0;

  private travarBody(y: number): void {
    document.body.style.position = 'fixed';
    document.body.style.top = -y + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }
  private destravarBody(y: number): void {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, y);
  }

  private setTelaCheia(v: boolean): void {
    if (v) {
      this.scrollAntes = window.scrollY;
      this.fechando = false;
      this.telaCheia = true;
      this.travarBody(this.scrollAntes);
      this.cdr.markForCheck();
    } else {
      if (!this.telaCheia || this.fechando) return;
      this.fechando = true;
      this.cdr.markForCheck();
      const y = this.scrollAntes;
      setTimeout(() => {
        this.telaCheia = false;
        this.fechando = false;
        this.destravarBody(y);
        this.cdr.markForCheck();
        // reorganiza só depois do monitor voltar ao tamanho normal
        setTimeout(() => { this.reorganizarJanelas(); this.cdr.markForCheck(); }, 60);
      }, 380);
    }
  }

  // ao voltar do modo tela cheia, recentraliza as janelas dentro do monitor
  private reorganizarJanelas(): void {
    const el = this.screen?.nativeElement;
    if (!el) return;
    const sw = el.clientWidth, sh = el.clientHeight;
    let i = 0;
    for (const w of this.windows) {
      if (w.max || w.kind === 'perfil') continue;
      const bx = Math.max(8, (sw - 280) / 2);
      const by = Math.max(8, (sh - 32 - 300) / 2 - 8);
      w.x = Math.round(Math.min(Math.max(8, bx + i * 22), Math.max(8, sw - 90)));
      w.y = Math.round(Math.min(Math.max(8, by + i * 20), Math.max(8, sh - 60)));
      i++;
    }
  }

  toggleTelaCheia(ev?: Event): void {
    ev?.stopPropagation();
    if (!this.telaCheia && ev) {
      const crt = (ev.currentTarget as HTMLElement).closest('.crt') as HTMLElement | null;
      if (crt) {
        const cr = crt.getBoundingClientRect();
        this.crtH = Math.round(cr.height);
        this.ml = Math.round(cr.left);
        this.mt = Math.round(cr.top);
        this.efx = +(cr.width / window.innerWidth).toFixed(4);
        this.efy = +(cr.height / window.innerHeight).toFixed(4);
      }
    }
    this.setTelaCheia(!this.telaCheia);
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.telaCheia) this.setTelaCheia(false);
  }

  openAbout(): void {
    this.startOpen = false;
    const id = 'about';
    const found = this.windows.find(w => w.id === id);
    if (found) { this.focus(found); return; }

    const n = this.windows.length;
    const p = this.centro(n, 322, 320);
    this.windows.push({
      id, kind: 'about', title: 'Como foi feito', icon: 'menu_book',
      x: p.x, y: p.y, z: ++this.zTop, max: this.ehMobile()
    });
  }

  bringToFront(w: Win): void {
    this.focus(w);
  }

  private ehMobile(): boolean {
    return window.matchMedia('(max-width: 700px)').matches;
  }

  close(id: string, ev?: Event): void {
    ev?.stopPropagation();
    this.windows = this.windows.filter(w => w.id !== id);
  }

  toggleMax(w: Win, ev?: Event): void {
    ev?.stopPropagation();
    w.max = !w.max;
    this.bringToFront(w);
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
    if (w.max) return;
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
