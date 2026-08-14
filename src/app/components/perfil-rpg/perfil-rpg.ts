import {
  Component,
  ElementRef,
  ViewChild,
  HostListener,
  AfterViewInit,
  OnDestroy,
  Input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

interface Atributo {
  n: string;
  nivel: string;
  v: number;
}

@Component({
  selector: 'app-perfil-rpg',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-rpg.html',
  styleUrls: ['./perfil-rpg.scss']
})
export class PerfilRpg implements AfterViewInit, OnDestroy {

  @ViewChild('port', { static: true }) port!: ElementRef<HTMLElement>;
  @ViewChild('card', { static: true }) card!: ElementRef<HTMLElement>;

  @Input() embutido = false;

  pos = 100;
  private dragging = false;

  noAlvo = false;
  private io?: IntersectionObserver;

  constructor(private theme: ThemeService) {}

  ngAfterViewInit(): void {
    if (this.embutido) return;

    this.io = new IntersectionObserver(
      entries => entries.forEach(e => {
        this.noAlvo = e.isIntersecting;
        this.theme.setBloodMoon(e.isIntersecting);
      }),
      { threshold: 0, rootMargin: '-50% 0px -50% 0px' }
    );
    this.io.observe(this.card.nativeElement);
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
    this.theme.setBloodMoon(false);
  }

  bio: string[] = [
    'Me chamo John. Sou formado em Análise e Desenvolvimento de Sistemas e já passei por algumas empresas como desenvolvedor. Hoje atuo como desenvolvedor front-end.',
    'Tenho experiência com o back-end, mas é no front que mora a minha paixão, me fascina o quanto dá pra criar uma experiência incrível para o usuário. Meu objetivo é chegar no nível dos trabalhos que aparecem no Awwwards.'
  ];

  atributos: Atributo[] = [
    { n: 'Frontend', nivel: 'avançado', v: 90 },
    { n: 'Auth & segurança', nivel: 'avançado', v: 82 },
    { n: 'Mobile', nivel: 'intermediário', v: 62 },
    { n: 'Backend', nivel: 'intermediário', v: 58 },
    { n: 'Banco de dados', nivel: 'iniciante', v: 44 }
  ];

  onDown(ev: PointerEvent): void {
    this.dragging = true;
    this.mover(ev);
  }

  @HostListener('document:pointermove', ['$event'])
  onMove(ev: PointerEvent): void {
    if (this.dragging) this.mover(ev);
  }

  @HostListener('document:pointerup')
  onUp(): void {
    this.dragging = false;
  }

  private mover(ev: PointerEvent): void {
    const r = this.port.nativeElement.getBoundingClientRect();
    const p = ((ev.clientX - r.left) / r.width) * 100;
    this.pos = Math.max(0, Math.min(100, p));
  }
}
