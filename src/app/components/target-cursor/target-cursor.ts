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
  @Input() focusOffsetY: number = -6;

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
      opacity: 0
    });

    this.setInitialCornerPosition();
    this.createSpin();
    this.initTargetDetection();

    const activeSection = document.querySelector(this.activeArea);

    if (!activeSection) return;

    activeSection.addEventListener('mouseenter', this.enableCursor);
    activeSection.addEventListener('mouseleave', this.disableCursor);

    // 🔥 correção do problema de iniciar já dentro da área
    if (activeSection.matches(':hover')) {
      this.enableCursor();
    }
  }

  ngOnDestroy(): void {

    this.spinTl?.kill();
    gsap.ticker.remove(this.tickerFn);
    window.removeEventListener('mousemove', this.moveHandler);

    document.body.style.cursor = this.originalCursor;
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

      if (!this.targetCornerPositions || !this.activeTarget) return;

      const cursorX =
        gsap.getProperty(this.cursorRef.nativeElement, 'x') as number;

      const cursorY =
        gsap.getProperty(this.cursorRef.nativeElement, 'y') as number;

      this.corners.forEach((corner, i) => {

        const targetX =
          this.targetCornerPositions![i].x - cursorX;

        const targetY =
          this.targetCornerPositions![i].y - cursorY;

        gsap.set(corner, {
          x: targetX,
          y: targetY
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

      const rect = target.getBoundingClientRect();

      const borderWidth = 3;
      const cornerSize = 12;

      this.targetCornerPositions = [
        { x: rect.left - borderWidth, y: rect.top - borderWidth + this.focusOffsetY },
        { x: rect.right + borderWidth - cornerSize, y: rect.top - borderWidth + this.focusOffsetY },
        { x: rect.right + borderWidth - cornerSize, y: rect.bottom + borderWidth - cornerSize + this.focusOffsetY },
        { x: rect.left - borderWidth, y: rect.bottom + borderWidth - cornerSize + this.focusOffsetY }
      ];

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

    const cornerSize = 12;

    const positions = [
      { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
      { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
      { x: cornerSize * 0.5, y: cornerSize * 0.5 },
      { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
    ];

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

  private setInitialCornerPosition() {

    const cornerSize = 12;

    const positions = [
      { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
      { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
      { x: cornerSize * 0.5, y: cornerSize * 0.5 },
      { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
    ];

    this.corners.forEach((corner, index) => {
      gsap.set(corner, {
        x: positions[index].x,
        y: positions[index].y
      });
    });
  }
}