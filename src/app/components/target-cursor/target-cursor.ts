import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';

@Component({
  selector: 'app-target-cursor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './target-cursor.html',
  styleUrls: ['./target-cursor.scss']
})
export class TargetCursorComponent implements AfterViewInit, OnDestroy {

  @Input() targetSelector: string = '.cursor-target';
  @Input() spinDuration: number = 2;
  @Input() hideDefaultCursor: boolean = true;
  @Input() hoverDuration: number = 0.2;
  @Input() activeArea: string = '.dark-section';
  @Input() dotOffsetX: number = 0;
  @Input() dotOffsetY: number = 0;
  @Input() focusOffsetY: number = 0;

  @ViewChild('cursor') cursorRef!: ElementRef<HTMLDivElement>;
  @ViewChild('dot') dotRef!: ElementRef<HTMLDivElement>;

  private corners!: NodeListOf<HTMLDivElement>;
  private spinTl!: gsap.core.Timeline;

  private activeTarget: Element | null = null;
  private targetCornerPositions: { x: number; y: number }[] | null = null;
  private activeStrength = { current: 0 };
  private pendingRelease = false;

  private tickerFn!: () => void;
  private originalCursor = '';

  ngAfterViewInit(): void {

    const cursor = this.cursorRef.nativeElement;

    this.corners =
      cursor.querySelectorAll<HTMLDivElement>('.target-cursor-corner');

    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      transformOrigin: '50% 50%',
      opacity: 0
    });

    this.setInitialCornerPosition();
    this.createSpin();
    this.initTargetDetection();

    const activeSection = document.querySelector(this.activeArea);

    if (!activeSection) return;

    activeSection.addEventListener('mouseenter', this.enableCursor);
    activeSection.addEventListener('mouseleave', this.disableCursor);

    if (activeSection.matches(':hover')) {
      this.enableCursor();
    }
    
    window.addEventListener('scroll', this.handleScroll, { passive: true });


  }

  ngOnDestroy(): void {

    this.spinTl?.kill();
    gsap.ticker.remove(this.tickerFn);
    window.removeEventListener('mousemove', this.moveHandler);

    document.body.style.cursor = this.originalCursor;
    window.removeEventListener('scroll', this.handleScroll);
  }

  private initMovement() {
    window.addEventListener('mousemove', (e) => {
      gsap.to(this.cursorRef.nativeElement, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: 'power3.out'
      });
    });
  }

  private createSpin() {
    this.spinTl?.kill();
    this.spinTl = gsap.timeline({ repeat: -1 })
      .to(this.cursorRef.nativeElement, {
        rotation: '+=360',
        duration: this.spinDuration,
        ease: 'none'
      });
  }

  private initTargetDetection() {

    this.tickerFn = () => {

      if (!this.activeTarget) return;

      // recalcula o retângulo do card a cada frame para os cantos
      // grudarem na borda mesmo com a animação de hover (translateY)
      const rect = this.activeTarget.getBoundingClientRect();

      const bw = 3;               // pequena folga em relação à borda
      const s = this.cornerSize;
      const oy = this.focusOffsetY;

      const abs = [
        { x: rect.left - bw,      y: rect.top - bw + oy },
        { x: rect.right + bw - s, y: rect.top - bw + oy },
        { x: rect.right + bw - s, y: rect.bottom + bw - s + oy },
        { x: rect.left - bw,      y: rect.bottom + bw - s + oy }
      ];

      const cursorX =
        gsap.getProperty(this.cursorRef.nativeElement, 'x') as number;

      const cursorY =
        gsap.getProperty(this.cursorRef.nativeElement, 'y') as number;

      this.corners.forEach((corner, i) => {
        gsap.set(corner, {
          x: abs[i].x - cursorX,
          y: abs[i].y - cursorY
        });
      });
    };

    window.addEventListener('mouseover', (e) => {

      const target =
        (e.target as Element).closest(this.targetSelector);

      if (!target) return;
      if (this.activeTarget === target) return;

      this.activeTarget = target;

      this.spinTl.pause();
      gsap.set(this.cursorRef.nativeElement, { rotation: 0 });

      gsap.ticker.add(this.tickerFn);

      gsap.to(this.activeStrength, {
        current: 1,
        duration: this.hoverDuration,
        ease: 'power2.out'
      });

      target.addEventListener('mouseleave', () => {
        this.pendingRelease = true;
      }, { once: true });

    });
  }

  private releaseTarget() {

    this.activeTarget = null;
    this.targetCornerPositions = null;

    gsap.ticker.remove(this.tickerFn);
    gsap.set(this.activeStrength, { current: 0 });

    const positions = this.idleCornerPositions();

    this.corners.forEach((corner, index) => {
      gsap.to(corner, {
        x: positions[index].x,
        y: positions[index].y,
        duration: 0.3,
        ease: 'power3.out'
      });
    });

    this.createSpin();
  }

  private enableCursor = () => {

    if (this.hideDefaultCursor) {
      this.originalCursor = document.body.style.cursor;
      document.body.style.cursor = 'none';
    }

    gsap.to(this.cursorRef.nativeElement, {
      opacity: 1,
      duration: 0.2
    });

    window.addEventListener('mousemove', this.moveHandler);
  };

  private disableCursor = () => {

    document.body.style.cursor = this.originalCursor;

    gsap.to(this.cursorRef.nativeElement, {
      opacity: 0,
      duration: 0.2
    });

    window.removeEventListener('mousemove', this.moveHandler);

    this.releaseTarget();
  };

  private moveHandler = (e: MouseEvent) => {

    if (this.pendingRelease) {
      this.pendingRelease = false;
      this.releaseTarget();
    }

    gsap.to(this.cursorRef.nativeElement, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.1,
      ease: 'power3.out'
    });

  };

  // Tamanho real do quadradinho de canto (bate com o .scss: width/height 14px)
  private readonly cornerSize = 14;

  // Posições de repouso SIMÉTRICas em torno de (0,0),
  // para que o cursor gire centralizado
  private idleCornerPositions() {
    const spread = 16; // distância do centro até a borda externa do canto
    const s = this.cornerSize;
    return [
      { x: -spread,     y: -spread },      // topo-esquerda
      { x: spread - s,  y: -spread },      // topo-direita
      { x: spread - s,  y: spread - s },   // baixo-direita
      { x: -spread,     y: spread - s }    // baixo-esquerda
    ];
  }

  private setInitialCornerPosition() {

    const positions = this.idleCornerPositions();

    this.corners.forEach((corner, index) => {
      gsap.set(corner, {
        x: positions[index].x,
        y: positions[index].y
      });
    });
  }

  private handleScroll = () => {

    if (this.activeTarget) {
      this.pendingRelease = false;
      this.releaseTarget();
    }

  };
}