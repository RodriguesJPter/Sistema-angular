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
  @Input() parallaxOn: boolean = true;
  @Input() activeArea: string = '.dark-section';

  @ViewChild('cursor', { static: false }) cursorRef!: ElementRef<HTMLDivElement>;
  @ViewChild('dot', { static: false }) dotRef!: ElementRef<HTMLDivElement>;

  private isActiveArea = false;
  private darkSection!: HTMLElement | null;
  private corners!: NodeListOf<HTMLDivElement>;
  private spinTl!: gsap.core.Timeline;
  private activeTarget: Element | null = null;
  private tickerFn!: () => void;
  private originalCursor = '';

  private targetCornerPositions: { x: number; y: number }[] | null = null;
  private activeStrength = { current: 0 };

  ngAfterViewInit(): void {
    if (this.isMobile()) return;

    this.darkSection = document.querySelector(this.activeArea);

    if (!this.darkSection) return;

    this.darkSection.addEventListener('mouseenter', this.enableCursor);
    this.darkSection.addEventListener('mouseleave', this.disableCursor);
  }

  ngOnDestroy(): void {
    this.disableCursor();

    if (this.darkSection) {
      this.darkSection.removeEventListener('mouseenter', this.enableCursor);
      this.darkSection.removeEventListener('mouseleave', this.disableCursor);
    }
  }

  private isMobile(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth <= 768
    );
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

  private moveHandler = (e: MouseEvent) => {
    gsap.to(this.cursorRef.nativeElement, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.1,
      ease: 'power3.out'
    });
  };

  private mouseDownHandler = () => {
    gsap.to(this.dotRef.nativeElement, { scale: 0.7, duration: 0.2 });
    gsap.to(this.cursorRef.nativeElement, { scale: 0.9, duration: 0.2 });
  };

  private mouseUpHandler = () => {
    gsap.to(this.dotRef.nativeElement, { scale: 1, duration: 0.2 });
    gsap.to(this.cursorRef.nativeElement, { scale: 1, duration: 0.2 });
  };

  private enterHandler = (e: Event) => {
    const target = (e.target as Element).closest(this.targetSelector);
    if (!target) return;
    if (this.activeTarget === target) return;

    this.activeTarget = target;
    this.spinTl.pause();
    gsap.set(this.cursorRef.nativeElement, { rotation: 0 });

    const rect = target.getBoundingClientRect();
    const borderWidth = 3;
    const cornerSize = 12;

    const cursorX = gsap.getProperty(this.cursorRef.nativeElement, 'x') as number;
    const cursorY = gsap.getProperty(this.cursorRef.nativeElement, 'y') as number;

    this.targetCornerPositions = [
      { x: rect.left - borderWidth, y: rect.top - borderWidth },
      { x: rect.right - cornerSize + borderWidth, y: rect.top - borderWidth },
      { x: rect.right - cornerSize + borderWidth, y: rect.bottom - cornerSize + borderWidth },
      { x: rect.left - borderWidth, y: rect.bottom - cornerSize + borderWidth }
    ];

    gsap.to(this.activeStrength, {
      current: 1,
      duration: this.hoverDuration
    });

    this.corners.forEach((corner, i) => {
      gsap.to(corner, {
        x: this.targetCornerPositions![i].x - cursorX,
        y: this.targetCornerPositions![i].y - cursorY,
        duration: 0.2
      });
    });

    target.addEventListener('mouseleave', this.leaveHandler, { once: true });
  };

  private leaveHandler = () => {
    this.activeTarget = null;
    this.targetCornerPositions = null;
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
    this.spinTl.restart();
  };

  private enableCursor = () => {
    if (this.isActiveArea) return;
    this.isActiveArea = true;

    const cursor = this.cursorRef.nativeElement;

    this.originalCursor = document.body.style.cursor;
    if (this.hideDefaultCursor) {
      document.body.style.cursor = 'none';
    }

    this.corners = cursor.querySelectorAll('.target-cursor-corner');

    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      opacity: 1
    });

    this.createSpin();

    window.addEventListener('mousemove', this.moveHandler);
    window.addEventListener('mouseover', this.enterHandler);
    window.addEventListener('mousedown', this.mouseDownHandler);
    window.addEventListener('mouseup', this.mouseUpHandler);
  };

  private disableCursor = () => {
    if (!this.isActiveArea) return;
    this.isActiveArea = false;

    window.removeEventListener('mousemove', this.moveHandler);
    window.removeEventListener('mouseover', this.enterHandler);
    window.removeEventListener('mousedown', this.mouseDownHandler);
    window.removeEventListener('mouseup', this.mouseUpHandler);

    this.spinTl?.kill();

    document.body.style.cursor = this.originalCursor;

    gsap.set(this.cursorRef.nativeElement, {
      opacity: 0
    });
  };
}