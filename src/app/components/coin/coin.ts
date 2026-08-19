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
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

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

rollAxis: 'x' | 'y' | 'z' = 'z';

turnAxis: 'x' | 'y' | 'z' = 'y';

spinAxis: 'x' | 'y' | 'z' = 'x';

targetX = 0;
rollSpeed = 8;
moveSpeed = 3;
fallSpeed = 4;

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

    const draco = new DRACOLoader();
    draco.setDecoderPath('assets/draco/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    loader.load(
      'assets/modelos/coin/coin.glb',
      (gltf) => {

        const object = gltf.scene;

        object.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) {
            const mat = m.material as THREE.MeshStandardMaterial;
            if (mat) { mat.metalness = 0.2; mat.roughness = 0.75; }
          }
        });

        this.model = object;

        this.pivot = new THREE.Object3D();
        this.scene.add(this.pivot);

        const box = new THREE.Box3().setFromObject(this.model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        this.model.position.sub(center);

        this.model.rotation.y = Math.PI;

        this.pivot.add(this.model);

        this.pivot.position.set(8, 2, 0);

        this.pivot.rotation.z = Math.PI / 2;

        this.modelReady = true;
        this.ready.emit();
      }
    );
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();

    if (this.pivot && this.isAnimating) {

      switch (this.phase) {

        case 0:
          this.pivot.position.x -= this.moveSpeed * delta;
          this.pivot.rotation[this.rollAxis] += this.rollSpeed * delta;

          if (this.pivot.position.x <= this.targetX) {
            this.phase = 1;
          }
          break;

        case 1:
          this.pivot.rotation[this.turnAxis] -= 3 * delta;

          if (Math.abs(this.pivot.rotation[this.turnAxis]) >= Math.PI / 2) {
            this.phase = 2;
          }
          break;

        case 2:
          this.pivot.rotation[this.spinAxis] += 6 * delta;

          const scaleFactor = 1 - 1.5 * delta;
          this.pivot.scale.multiplyScalar(scaleFactor);

          if (this.pivot.scale.x <= 0.3) {
            this.phase = 3;
          }
          break;

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
