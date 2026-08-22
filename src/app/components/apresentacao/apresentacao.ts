import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  NgZone,
  HostListener,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface Opcao {
  txt: string;
  goto: number;
}

interface Fala {
  img: string;      // nome da imagem do mascote (sem extensão)
  txt: string;
  nome?: string;
  opts?: Opcao[];   // se tiver, mostra escolhas ao terminar de digitar
  goto?: number;    // próximo índice (default: idx + 1)
  fim?: boolean;    // última fala -> vai pro PC
  google?: boolean; // ao avançar, redireciona pro Google
}

@Component({
  selector: 'app-apresentacao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './apresentacao.html',
  styleUrls: ['./apresentacao.scss']
})
export class Apresentacao implements OnInit, OnDestroy {
  @Output() concluir = new EventEmitter<void>();

  // índices das conversas de retorno (1ª volta e das próximas)
  private readonly VOLTA = 20;
  private readonly VOLTA2 = 24;

  // roteiro do NPC (você) - ramificado
  falas: Fala[] = [
    // 0 - pergunta inicial
    {
      img: 'aceno', nome: 'John', txt: 'E aí, chefe! O que você tá fazendo por aqui?',
      opts: [
        { txt: 'Estou curioso', goto: 1 },
        { txt: 'Não tinha nada melhor pra fazer', goto: 7 },
        { txt: 'Eu vim pelo link', goto: 17 }
      ]
    },
    // 1..6 - ramo "curioso"
    { img: 'apresentando', txt: 'Bem, já que você está aqui, deixa eu te mostrar o que eu tenho feito.' },
    { img: 'parado', txt: 'Não sei se você sabe, mas eu sou desenvolvedor. Eu faço telinhas.' },
    { img: 'apresentando', txt: 'Mas eu também tenho experiência com outras coisas.' },
    { img: 'parado', txt: 'Como aplicativos, criação de end-points e por aí vai...' },
    { img: 'joia', txt: 'Ah, e no meu tempo livre eu gosto de fazer jogos.' },
    { img: 'apresentando', txt: 'Se quiser saber mais, dá uma olhada no meu computador. Ele é meio velho, mas funciona.', fim: true },
    // 7..9 - ramo "nada melhor pra fazer"
    { img: 'parado', txt: 'Ah, tudo bem. Também é uma forma de aprender coisas novas.' },
    { img: 'apresentando', txt: 'Prazer, eu sou o John, desenvolvedor front-end.' },
    {
      img: 'parado', txt: 'Também tenho experiência com outras áreas, tipo back-end, banco de dados...',
      opts: [
        { txt: 'Ah, que saco!', goto: 10 },
        { txt: 'Olha só, que interessante', goto: 13 }
      ]
    },
    // 10..12 - "que saco" -> Google
    { img: 'duvida', txt: 'Eu sinto muito por incomodar com a minha faladeira,' },
    { img: 'chorando', txt: 'eu fico empolgado às vezes e acabo falando demais.' },
    { img: 'chorando', txt: 'Vou te deixar em paz.', google: true },
    // 13..16 - "interessante" -> PC
    { img: 'joia', txt: 'Não é?! Eu quero ser alguém com quem as pessoas possam contar.' },
    { img: 'parado', txt: 'Sei que corro o risco de virar pau pra toda obra, mas é bom saber um pouco de tudo.' },
    { img: 'parado', txt: 'Mesmo eu me especializando em front-end.' },
    { img: 'apresentando', txt: 'Por favor, dá uma olhada na minha experiência no PC.', fim: true },
    // 17..19 - ramo "vim pelo link"
    { img: 'aceno', txt: 'Muito obrigado por vir até aqui!' },
    { img: 'apresentando', txt: 'Esse é o meu portfólio. Tô fazendo ele pra poder mostrar as minhas habilidades.' },
    { img: 'apresentando', txt: 'Bom, deixa eu te mostrar... ou melhor: vê no meu PC.', fim: true },
    // 20..23 - conversa de RETORNO (já viu o PC)
    {
      img: 'aceno', txt: 'Ah, você voltou! E então?',
      opts: [
        { txt: 'Ah, eu vi o seu PC', goto: 21 },
        { txt: 'Que chato', goto: 23 }
      ]
    },
    {
      img: 'duvida', txt: 'Ah, e me fala: gostou do que eu fiz?',
      opts: [
        { txt: 'Gostei muito', goto: 22 },
        { txt: 'Não gostei', goto: 23 }
      ]
    },
    { img: 'joia', txt: 'Ah, muito obrigado! Levou um tempo pra ajustar tudo, mas achei recompensador.', fim: true },
    { img: 'chorando', txt: 'Sinto muito por incomodar.', google: true },
    // 24 - a partir da 2ª volta
    { img: 'apresentando', txt: 'Ah, continue explorando o meu PC, ou pode entrar em contato comigo.', fim: true }
  ];

  // fala especial quando segura o botão de pular
  private choro: Fala = {
    img: 'chorando',
    nome: 'John',
    txt: 'Ei, calma! Não me pula ainda... eu ainda tenho um monte de coisa pra te contar!'
  };

  idx = 0;
  texto = '';           // texto revelado (efeito máquina de escrever)
  digitando = false;
  mostrarOpts = false;
  segurando = false;    // segurando pra pular (barra de espaço)
  progPular = 0;        // 0..100
  private concluido = false;
  private pcVezes = 0;   // quantas vezes já foi pro PC

  private alvo = '';
  private tipoId = -1;
  private rafId = -1;
  private holdInicio = 0;
  private readonly HOLD_MS = 1600;
  private io?: IntersectionObserver;
  private visivel = false;
  dentro = false;        // seção visível (dispara as animações de entrada)
  private entrou = false; // já iniciou a conversa ao menos uma vez

  constructor(
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private host: ElementRef<HTMLElement>
  ) {}

  get fala(): Fala {
    return this.segurando ? this.choro : this.falas[this.idx];
  }

  ngOnInit(): void {
    // a conversa só começa quando a seção aparece (não no load da página)
    this.io = new IntersectionObserver((es) => {
      const vis = es[0].isIntersecting && es[0].intersectionRatio > 0.4;
      this.dentro = vis;
      if (vis && !this.visivel) {
        this.resetarSkip();
        if (!this.entrou) {
          this.entrou = true;
          this.iniciarFala(0);
        } else if (this.pcVezes >= 2) {
          this.iniciarFala(this.VOLTA2);
        } else if (this.pcVezes === 1) {
          this.iniciarFala(this.VOLTA);
        }
      }
      this.visivel = vis;
      this.cdr.markForCheck();
    }, { threshold: [0, 0.4, 0.8] });
    this.io.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    clearInterval(this.tipoId);
    cancelAnimationFrame(this.rafId);
    this.io?.disconnect();
  }

  private resetarSkip(): void {
    cancelAnimationFrame(this.rafId);
    this.segurando = false;
    this.progPular = 0;
    this.concluido = false;
  }

  private iniciarFala(i: number): void {
    this.idx = i;
    this.mostrarOpts = false;
    this.digitar(this.falas[i].txt);
  }

  private digitar(txt: string): void {
    clearInterval(this.tipoId);
    this.alvo = txt;
    this.texto = '';
    this.digitando = true;
    let k = 0;
    this.zone.runOutsideAngular(() => {
      this.tipoId = window.setInterval(() => {
        k++;
        this.texto = this.alvo.slice(0, k);
        if (k >= this.alvo.length) {
          clearInterval(this.tipoId);
          this.digitando = false;
          if (!this.segurando && this.falas[this.idx].opts) this.mostrarOpts = true;
        }
        this.cdr.markForCheck();
      }, 28);
    });
  }

  private completar(): void {
    clearInterval(this.tipoId);
    this.texto = this.alvo;
    this.digitando = false;
    if (!this.segurando && this.falas[this.idx].opts) this.mostrarOpts = true;
    this.cdr.markForCheck();
  }

  // clique na área de diálogo (avança / completa)
  avancar(): void {
    if (this.segurando) return;
    if (this.digitando) { this.completar(); return; }
    if (this.mostrarOpts) return;              // precisa escolher uma opção
    const f = this.falas[this.idx];
    if (f.google) { window.location.href = 'https://www.google.com'; return; }
    if (f.fim) { this.finalizar(); return; }
    this.iniciarFala(f.goto ?? this.idx + 1);
  }

  escolher(o: Opcao): void {
    if (this.segurando) return;
    this.mostrarOpts = false;
    this.iniciarFala(o.goto);
  }

  private finalizar(): void {
    if (this.concluido) return;
    this.concluido = true;
    this.pcVezes++;
    this.segurando = false;
    this.progPular = 0;
    cancelAnimationFrame(this.rafId);
    this.concluir.emit();
  }

  // ===== segurar a barra de espaço pra pular =====
  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (e.code !== 'Space' || e.repeat || this.concluido) return;
    const ae = document.activeElement as HTMLElement | null;
    if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA')) return;
    e.preventDefault();
    this.pularInicio(e);
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(e: KeyboardEvent): void {
    if (e.code === 'Space') this.pularFim();
  }

  pularInicio(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    if (this.segurando || this.concluido) return;
    this.segurando = true;
    this.mostrarOpts = false;
    this.holdInicio = performance.now();
    // mostra a fala de choro (sem digitar, direto)
    clearInterval(this.tipoId);
    this.texto = this.choro.txt;
    this.digitando = false;
    this.zone.runOutsideAngular(() => this.tickPular());
    this.cdr.markForCheck();
  }

  private tickPular(): void {
    const t = performance.now() - this.holdInicio;
    this.progPular = Math.min(100, (t / this.HOLD_MS) * 100);
    this.cdr.markForCheck();
    if (this.progPular >= 100) {
      this.finalizar();
      return;
    }
    this.rafId = requestAnimationFrame(() => this.tickPular());
  }

  pularFim(): void {
    if (!this.segurando) return;
    cancelAnimationFrame(this.rafId);
    this.segurando = false;
    this.progPular = 0;
    // retoma de onde parou: repõe a fala atual completa
    const f = this.falas[this.idx];
    this.texto = f.txt;
    this.digitando = false;
    this.mostrarOpts = !!f.opts;
    this.cdr.markForCheck();
  }
}
