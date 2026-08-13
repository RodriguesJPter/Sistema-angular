import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Input
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface Contato {
  label: string;
  valor: string;
  href: string;
}

@Component({
  selector: 'app-contato-terminal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contato-terminal.html',
  styleUrls: ['./contato-terminal.scss']
})
export class ContatoTerminal implements AfterViewInit, OnDestroy {

  @ViewChild('root', { static: true }) root!: ElementRef<HTMLElement>;

  @Input() embutido = false;

  private readonly comandoFull = 'contato --list';
  cmd = '';
  mostrarResultado = false;

  contatos: Contato[] = [
    { label: 'instagram', valor: '@john.r.r.peter',            href: 'https://instagram.com/john.r.r.peter' },
    { label: 'linkedin',  valor: 'in/john-rodrigues',          href: 'https://www.linkedin.com/in/john-rodrigues-462b38234/' },
    { label: 'email',     valor: 'rodriguesjohn22@gmail.com',  href: 'mailto:rodriguesjohn22@gmail.com' },
    { label: 'whatsapp',  valor: '(11) 91335-5144',            href: 'https://wa.me/5511913355144' }
  ];

  private io?: IntersectionObserver;
  private timer?: ReturnType<typeof setInterval>;
  private iniciado = false;

  ngAfterViewInit(): void {
    this.io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !this.iniciado) {
          this.iniciado = true;
          this.digitar();
        }
      });
    }, { threshold: 0.4 });

    this.io.observe(this.root.nativeElement);
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
    if (this.timer) clearInterval(this.timer);
  }

  private digitar(): void {
    let i = 0;
    this.timer = setInterval(() => {
      i++;
      this.cmd = this.comandoFull.slice(0, i);
      if (i >= this.comandoFull.length) {
        if (this.timer) clearInterval(this.timer);
        setTimeout(() => (this.mostrarResultado = true), 350);
      }
    }, 60);
  }
}
