import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { Renderer, Program, Mesh, Triangle, Transform, Vec3, Camera } from 'ogl';

@Component({
  selector: 'app-metaballs',
  standalone: true,
  template: `<div #container class="metaballs-container"></div>`,
  styles: [`
    .metaballs-container {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }
    canvas {
      display: block;
    }
  `]
})
export class MetaballsComponent implements AfterViewInit, OnDestroy {

  @ViewChild('container', { static: true })
  containerRef!: ElementRef<HTMLDivElement>;

  @Input() color: string = '#ffffff';
  @Input() cursorBallColor: string = '#ffffff';
  @Input() speed: number = 0.3;
  @Input() animationSize: number = 30;
  @Input() ballCount: number = 15;
  @Input() clumpFactor: number = 1;
  @Input() cursorBallSize: number = 3;
  @Input() enableTransparency: boolean = false;

  private renderer!: Renderer;
  private program!: Program;
  private animationId!: number;

  ngAfterViewInit(): void {
    this.initWebGL();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
  }

  private parseHexColor(hex: string): Vec3 {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16) / 255;
    const g = parseInt(c.substring(2, 4), 16) / 255;
    const b = parseInt(c.substring(4, 6), 16) / 255;
    return new Vec3(r, g, b);
  }

  private initWebGL() {

    const container = this.containerRef.nativeElement;

    this.renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: false,
      webgl: 2
    });

    const gl = this.renderer.gl;
    gl.clearColor(0, 0, 0, this.enableTransparency ? 0 : 1);
    container.appendChild(gl.canvas);

    const camera = new Camera(gl, {
      left: -1,
      right: 1,
      top: 1,
      bottom: -1,
      near: 0.1,
      far: 10
    });
    camera.position.z = 1;

    const geometry = new Triangle(gl);

    const vertex = `#version 300 es
    precision highp float;
    layout(location = 0) in vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }`;

    const fragment = `#version 300 es
      precision highp float;

      uniform vec3 iResolution;
      uniform float iTime;
      uniform vec3 iMouse;
      uniform vec3 iColor;
      uniform vec3 iCursorColor;
      uniform float iAnimationSize;
      uniform int iBallCount;
      uniform float iCursorBallSize;
      uniform vec3 iMetaBalls[50];
      uniform float iClumpFactor;
      uniform bool enableTransparency;

      out vec4 outColor;

      float getMetaBallValue(vec2 c, float r, vec2 p) {
        vec2 d = p - c;
        float dist2 = dot(d, d);
        dist2 = max(dist2, 0.0001);
        return (r * r) / dist2;
      }

      void main() {

        vec2 fc = gl_FragCoord.xy;

        float scale = iAnimationSize / iResolution.y;
        vec2 coord = (fc - iResolution.xy * 0.5) * scale;
        vec2 mouseW = (iMouse.xy - iResolution.xy * 0.5) * scale;

        float m1 = 0.0;

        for (int i = 0; i < 50; i++) {
          if (i >= iBallCount) break;
          m1 += getMetaBallValue(iMetaBalls[i].xy, iMetaBalls[i].z, coord);
        }

        float m2 = getMetaBallValue(mouseW, iCursorBallSize, coord);

        float total = m1 + m2;

        // ===== COR FINAL =====
        vec3 cFinal = vec3(0.0);

        if (total > 0.0) {
          float alpha1 = m1 / total;
          float alpha2 = m2 / total;
          cFinal = iColor * alpha1 + iCursorColor * alpha2;
        }

        // ===== CORTE LIMPO (SEM SOMBRA) =====
        float threshold = 1.2;

        if (total > threshold) {
          outColor = vec4(cFinal, enableTransparency ? 1.0 : 1.0);
        } else {
          discard;
        }
      }
      `;

    const metaBallsUniform: Vec3[] = [];
    for (let i = 0; i < 50; i++) {
      metaBallsUniform.push(new Vec3(0, 0, 0));
    }

    this.program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Vec3() },
        iMouse: { value: new Vec3() },
        iColor: { value: this.parseHexColor(this.color) },
        iCursorColor: { value: this.parseHexColor(this.cursorBallColor) },
        iAnimationSize: { value: this.animationSize },
        iBallCount: { value: this.ballCount },
        iCursorBallSize: { value: this.cursorBallSize },
        iMetaBalls: { value: metaBallsUniform },
        iClumpFactor: { value: this.clumpFactor },
        enableTransparency: { value: this.enableTransparency }
      }
    });

    const mesh = new Mesh(gl, { geometry, program: this.program });
    const scene = new Transform();
    mesh.setParent(scene);

    const resize = () => {
      const rect = container.getBoundingClientRect();

      this.renderer.setSize(rect.width, rect.height);

      this.program.uniforms['iResolution'].value.set(
        rect.width,
        rect.height,
        0
      );
    };

    window.addEventListener('resize', resize);
    resize();

    const startTime = performance.now();

    const animate = (t: number) => {
      this.animationId = requestAnimationFrame(animate);

      const elapsed = (t - startTime) * 0.001;
      this.program.uniforms['iTime'].value = elapsed;

      for (let i = 0; i < this.ballCount; i++) {
        const angle = elapsed * this.speed * (i + 1);
        const x = Math.cos(angle) * 6.0 * this.clumpFactor;
        const y = Math.sin(angle) * 6.0 * this.clumpFactor;
        metaBallsUniform[i].set(x, y, 2.5);
      }

      this.renderer.render({ scene, camera });
    };

    this.animationId = requestAnimationFrame(animate);
  }
}