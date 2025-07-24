import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

@Component({
  selector: 'app-campo-tela',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campo-tela.html',
  styleUrls: ['./campo-tela.scss']
})
export class CampoTela implements AfterViewInit {

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private container!: HTMLElement;
  private objeto3D!: THREE.Object3D;
  private directionalLight!: THREE.DirectionalLight;

  constructor() {}

  ngAfterViewInit(): void {
    this.inicializarCena();
    this.carregarObjeto();
  }

  inicializarCena(): void {
    this.container = document.getElementById('canvas-container')!;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x202020);

    this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
    this.camera.position.set(0, 2, 5);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Luz ambiente adicional
    this.scene.add(ambientLight);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.scene.add(this.directionalLight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    this.animar();

    window.addEventListener('resize', () => {
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    });
  }

carregarObjeto(): void {
  const mtlLoader = new MTLLoader();
  mtlLoader.setPath('assets/modelos/');
  mtlLoader.load('angel_gun.mtl', (materials) => {
    materials.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath('assets/modelos/');
    objLoader.load('angel_gun.obj', (object) => {
      object.scale.set(0.1, 0.1, 0.1);
      object.position.set(0, 0, 0);
      this.scene.add(object);
      this.objeto3D = object;
    }, undefined, (error) => {
      console.error('Erro ao carregar OBJ:', error);
    });
  }, undefined, (error) => {
    console.error('Erro ao carregar MTL:', error);
  });
}


  animar(): void {
  requestAnimationFrame(() => this.animar());

  this.controls.update();

  // Atualiza posição da luz para a posição da câmera
  this.directionalLight.position.copy(this.camera.position);

  // Opcional: direção da luz para onde a câmera está olhando (olhar no eixo Z da câmera)
  const cameraDirection = new THREE.Vector3();
  this.camera.getWorldDirection(cameraDirection);
  this.directionalLight.target.position.copy(this.camera.position.clone().add(cameraDirection));
  this.directionalLight.target.updateMatrixWorld();

  this.renderer.render(this.scene, this.camera);
  }

  resetarCena(): void {
    if (this.objeto3D) {
      this.scene.remove(this.objeto3D);
    }
    this.carregarObjeto();
  }
}
