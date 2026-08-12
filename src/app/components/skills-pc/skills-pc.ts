import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface Tech {
  name: string;
  desc: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;   // Material Icons font name
  fileIcon: string;
  techs: Tech[];
}

interface Win {
  id: string;
  kind: 'folder' | 'note' | 'about';
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
  imports: [CommonModule],
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

  // Texto provisório — edite aqui para contar como você usa/estudou cada tecnologia.
  private ph(n: string): string {
    return `[texto provisório] Aqui vai a explicação de como eu uso e onde estudei/apliquei ${n}. ` +
           `Edite este texto em skills-pc.ts.`;
  }

  categories: Category[] = [
    {
      id: 'front', name: 'Frontend', icon: 'web', fileIcon: 'code',
      techs: ['Angular', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Angular Material', 'RxJS', 'APIs REST']
        .map(n => ({ name: n, desc: this.ph(n) }))
    },
    {
      id: 'mobile', name: 'Mobile', icon: 'smartphone', fileIcon: 'phone_iphone',
      techs: ['React Native', 'Expo', 'React Native Paper', 'WebView', 'AsyncStorage', 'SecureStore']
        .map(n => ({ name: n, desc: this.ph(n) }))
    },
    {
      id: 'back', name: 'Backend', icon: 'dns', fileIcon: 'terminal',
      techs: ['Python', 'FastAPI', 'APIs REST', 'CRUD', 'Pydantic', 'Router / Service / Repository', 'Validação de dados']
        .map(n => ({ name: n, desc: this.ph(n) }))
    },
    {
      id: 'db', name: 'Banco de dados', icon: 'storage', fileIcon: 'table_chart',
      techs: ['PostgreSQL', 'SQL', 'Integração app e banco']
        .map(n => ({ name: n, desc: this.ph(n) }))
    },
    {
      id: 'auth', name: 'Auth e segurança', icon: 'lock', fileIcon: 'vpn_key',
      techs: ['Keycloak', 'OAuth 2.0', 'OpenID Connect', 'JWT', 'Autenticação e autorização']
        .map(n => ({ name: n, desc: this.ph(n) }))
    }
  ];

  // "Making of" — como este componente foi feito (edite à vontade)
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

  // ---- ciclo de vida ----
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

  // ---- boot ----
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

  // ---- janelas ----
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

  // ---- arrastar janelas ----
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
