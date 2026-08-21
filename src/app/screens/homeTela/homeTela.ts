import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillsPc } from '../../components/skills-pc/skills-pc';
import { Intro } from '../../components/intro/intro';

@Component({
  selector: 'app-home-tela',
  standalone: true,
  imports: [
    CommonModule,
    SkillsPc,
    Intro
  ],
  templateUrl: './homeTela.html',
  styleUrls: ['./homeTela.scss']
})
export class HomeTela implements AfterViewInit, OnDestroy {

  private secoes: HTMLElement[] = [];
  private travado = false;
  private tY = 0;

  ngAfterViewInit(): void {
    this.pegarSecoes();
    window.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd);
  }

  ngOnDestroy(): void {
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
  }

  private pegarSecoes(): void {
    this.secoes = Array.from(document.querySelectorAll('.pagina')) as HTMLElement[];
  }

  // navega o full-page, exceto: em tela cheia do PC, ou sobre um conteúdo
  // realmente rolável (ex.: uma nota/aba com scroll) na direção do movimento
  private podeNavegar(e: Event, dir: number): boolean {
    if (document.body.style.position === 'fixed') return false;
    const t = e.target as HTMLElement | null;
    if (t && this.temRolagem(t, dir)) return false;
    return true;
  }

  private temRolagem(el: HTMLElement, dir: number): boolean {
    let n: HTMLElement | null = el;
    while (n && n !== document.body && n !== document.documentElement) {
      const oy = getComputedStyle(n).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight + 2) {
        if (dir > 0 && n.scrollTop + n.clientHeight < n.scrollHeight - 1) return true;
        if (dir < 0 && n.scrollTop > 1) return true;
      }
      n = n.parentElement;
    }
    return false;
  }

  private atual(): number {
    const meio = window.scrollY + window.innerHeight / 2;
    let melhor = 0, dist = Infinity;
    this.secoes.forEach((s, i) => {
      const centro = s.offsetTop + s.offsetHeight / 2;
      const d = Math.abs(centro - meio);
      if (d < dist) { dist = d; melhor = i; }
    });
    return melhor;
  }

  avancarPara(i: number): void {
    if (!this.secoes.length) this.pegarSecoes();
    i = Math.max(0, Math.min(this.secoes.length - 1, i));
    this.travado = true;
    this.secoes[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { this.travado = false; }, 850);
  }

  private onWheel = (e: WheelEvent): void => {
    const dir = e.deltaY > 0 ? 1 : -1;
    if (!this.podeNavegar(e, dir)) return;
    e.preventDefault();
    if (this.travado || Math.abs(e.deltaY) < 6) return;
    this.avancarPara(this.atual() + dir);
  };

  private onKey = (e: KeyboardEvent): void => {
    if (document.body.style.position === 'fixed') return;
    const t = e.target as HTMLElement | null;
    if (t && (t.closest('.crt-screen') || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); this.avancarPara(this.atual() + 1); }
    else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); this.avancarPara(this.atual() - 1); }
  };

  private onTouchStart = (e: TouchEvent): void => {
    this.tY = e.touches[0].clientY;
  };

  private onTouchMove = (e: TouchEvent): void => {
    const dir = this.tY - e.touches[0].clientY > 0 ? 1 : -1;
    if (this.podeNavegar(e, dir)) e.preventDefault();
  };

  private onTouchEnd = (e: TouchEvent): void => {
    const dy = this.tY - e.changedTouches[0].clientY;
    const dir = dy > 0 ? 1 : -1;
    if (!this.podeNavegar(e, dir)) return;
    if (this.travado || Math.abs(dy) < 50) return;
    this.avancarPara(this.atual() + dir);
  };
}
