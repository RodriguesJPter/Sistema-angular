import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Output, 
  EventEmitter 
} from '@angular/core';

import { Router } from '@angular/router';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

@Component({
  selector: 'app-coin',
  standalone: true,
  templateUrl: './coin.html',
  styleUrls: ['./coin.scss']
})
export class CoinComponent implements AfterViewInit, OnDestroy {
  @Output() ready = new EventEmitter<void>();
  @ViewChild('canvasContainer', { static: true })
  canvasRef!: ElementRef<HTMLDivElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  public modelReady = false;
  private model!: THREE.Group;
  private pivot!: THREE.Object3D;

  private animationId!: number;
  private clock = new THREE.Clock();

  private phase = 0;
  private isAnimating = false;

// ===== CONFIGURÁVEIS =====

// eixo da rolagem (moeda rolando no chão)
rollAxis: 'x' | 'y' | 'z' = 'z';

// eixo da virada (tombar para dentro)
turnAxis: 'x' | 'y' | 'z' = 'y';

// eixo do giro final antes de cair
spinAxis: 'x' | 'y' | 'z' = 'x';

targetX = 0;      // ponto onde vira
rollSpeed = 8;    // velocidade de rotação
moveSpeed = 3;    // velocidade horizontal
fallSpeed = 4;    // velocidade queda
// ==========================

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.initThree();
    this.loadModel();
    this.animate();
  }

  private initThree(): void {
    const width = this.canvasRef.nativeElement.clientWidth;
    const height = this.canvasRef.nativeElement.clientHeight;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 2, 6);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.canvasRef.nativeElement.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    this.scene.add(directionalLight);
  }

  private loadModel(): void {
    
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath('assets/modelos/coin/');

    mtlLoader.load(
      'Meshy_AI_Golden_Hare_Coin_0303130106_texture.mtl',
      (materials) => {

        materials.preload();

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('assets/modelos/coin/');

        objLoader.load(
          'Meshy_AI_Golden_Hare_Coin_0303130106_texture.obj',
          (object) => {

            this.model = object;
            
            // === CRIA PIVOT CENTRALIZADO ===
            this.pivot = new THREE.Object3D();
            this.scene.add(this.pivot);

            const box = new THREE.Box3().setFromObject(this.model);
            const center = new THREE.Vector3();
            box.getCenter(center);
            this.model.position.sub(center);
            
            this.model.rotation.y = Math.PI; 

            this.pivot.add(this.model);

            // posição inicial (fora da tela)
            this.pivot.position.set(8, 2, 0);

            // moeda "em pé"
            this.pivot.rotation.z = Math.PI / 2;

            this.modelReady = true;
            this.ready.emit();
          }
        );
      }
    );
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();

    if (this.pivot && this.isAnimating) {

      switch (this.phase) {

        // =========================
        // FASE 0 - ROLANDO
        // =========================
        case 0:
          this.pivot.position.x -= this.moveSpeed * delta;
          this.pivot.rotation[this.rollAxis] += this.rollSpeed * delta;

          if (this.pivot.position.x <= this.targetX) {
            this.phase = 1;
          }
          break;

        // =========================
        // FASE 1 - TOMBANDO PARA DENTRO
        // =========================
        case 1:
          this.pivot.rotation[this.turnAxis] -= 3 * delta;

          // ajusta até aproximadamente 90 graus
          if (Math.abs(this.pivot.rotation[this.turnAxis]) >= Math.PI / 2) {
            this.phase = 2;
          }
          break;

        // =========================
        // FASE 2 - GIRANDO E ENCOLHENDO
        // =========================
        case 2:
          this.pivot.rotation[this.spinAxis] += 6 * delta;

          const scaleFactor = 1 - 1.5 * delta;
          this.pivot.scale.multiplyScalar(scaleFactor);

          if (this.pivot.scale.x <= 0.3) {
            this.phase = 3;
          }
          break;

        // =========================
        // FASE 3 - CAINDO
        // =========================
        case 3:
          this.pivot.position.y -= this.fallSpeed * delta;

          if (this.pivot.position.y < -5) {
            this.finishAnimation();
          }
          break;
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  private finishAnimation(): void {
    console.log('finalizando animação');
    this.isAnimating = false;
    this.router.navigate(['/home']);
  }

  // CHAMADO PELO START COMPONENT
  startAnimation(): void {

    if (!this.modelReady) {
      console.warn('Modelo ainda carregando...');
      return;
    }

    this.phase = 0;
    this.clock.start();
    this.isAnimating = true;
  }

  

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }
}