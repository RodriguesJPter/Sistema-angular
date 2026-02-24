import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from '@angular/core';

import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';


@Component({
  selector: 'app-angel3d',
  templateUrl: './angel3d.html',
  styleUrls: ['./angel3d.scss']
})
export class Angel3dComponent implements AfterViewInit, OnDestroy {

  @ViewChild('canvasContainer', { static: true })
  container!: ElementRef<HTMLDivElement>;

  @ViewChild('darkSection', { static: true })
  darkSection!: ElementRef<HTMLDivElement>;
  
  private baseRotationY = Math.PI;
  private autoRotation = 0;
  private wasMouseInside = false;
  private isMouseInside = false;
  private darkSectionElement!: HTMLElement;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationId!: number;
  private model!: THREE.Object3D;
  private mouseX = 0;
  private mouseY = 0;
  private mouseOffsetX = 0.165;
  private mouseOffsetY = 0.1;

  ngAfterViewInit(): void {
    this.initThree();
    this.animate();
    this.darkSectionElement = document.querySelector('.dark-section') as HTMLElement;
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }

  private initThree(): void {

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1, 3);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });

    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;

    this.renderer.setSize(width, height);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setClearColor(0x000000, 0); 

    this.container.nativeElement.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    const mtlLoader = new MTLLoader();
    mtlLoader.setPath('assets/modelos/');

    mtlLoader.load('angel_gun.mtl', (materials) => {

      materials.preload();

      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath('assets/modelos/');

      objLoader.load('angel_gun.obj', (object) => {

      object.scale.set(0.5, 0.5, 0.5);
      
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      
      object.position.sub(center);

      this.model = object;
      this.scene.add(this.model);

      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = this.camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

      cameraZ *= 1.4;

      this.camera.position.set(0, 0, cameraZ);
      this.camera.lookAt(0, 0, 0);

    });
    });

    window.addEventListener('resize', () => {
      const width = this.container.nativeElement.clientWidth;
      const height = this.container.nativeElement.clientHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });

    window.addEventListener('mousemove', (event) => {
      this.handleMouseMove(event);
    });
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    if (this.model) {

      let desiredY: number;
      let desiredX: number;

      if (!this.isMouseInside && this.wasMouseInside) {
        this.autoRotation = this.model.rotation.y;
      }

      if (this.isMouseInside) {

        desiredY = this.baseRotationY + (this.mouseX * 0.8);
        desiredX = this.mouseY * 0.5;

      } else {

        this.autoRotation += 0.01;
        desiredY = this.autoRotation;
        desiredX = 0;
      }

      this.model.rotation.y += (desiredY - this.model.rotation.y) * 0.08;
      this.model.rotation.x += (desiredX - this.model.rotation.x) * 0.08;

      this.wasMouseInside = this.isMouseInside;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private handleMouseMove(event: MouseEvent): void {

    if (!this.darkSectionElement) return;

    const rect = this.darkSectionElement.getBoundingClientRect();

    const isInside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    this.isMouseInside = isInside;

    if (!isInside) return;

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    this.mouseX = ((x - 0.5) + this.mouseOffsetX) * 2;
    this.mouseY = ((y - 0.35) + this.mouseOffsetY) * 2;
  }
}