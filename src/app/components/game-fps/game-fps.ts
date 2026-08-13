import {
  Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';

type Pic = HTMLImageElement | HTMLCanvasElement;

interface Sprite {
  x: number; y: number;
  img: () => Pic | null;
  scale: number;
  ground: boolean;
}

@Component({
  selector: 'app-game-fps',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-fps.html',
  styleUrls: ['./game-fps.scss']
})
export class GameFps implements AfterViewInit, OnDestroy {

  @ViewChild('cv', { static: true }) cv!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private raf = 0;
  private readonly W = 260;
  private readonly H = 160;

  private readonly MAP = [
    '################',
    '#..............#',
    '#..###....###..#',
    '#..............#',
    '#....#....#....#',
    '#..............#',
    '#..##......##..#',
    '#..............#',
    '#..............#',
    '#..##......##..#',
    '#..............#',
    '#....#....#....#',
    '#..............#',
    '#..###....###..#',
    '#..............#',
    '################',
  ];
  private readonly MS = 16;

  player = { x: 8, y: 8, ang: 0, hp: 100, ammo: 30 };
  private keys: Record<string, boolean> = {};
  ativo = false;

  private enemy = {
    x: 8, y: 3, hp: 100,
    state: 'walk' as 'walk' | 'attack' | 'dying' | 'dead',
    frame: 0, ft: 0, atkCd: 0
  };
  private fireballs: { x: number; y: number; dx: number; dy: number; frame: number; ft: number }[] = [];

  private wpn = { state: 'idle' as 'idle' | 'shoot' | 'sword', frame: 0, ft: 0, hit: false };
  private fbAnim = 0;
  private bob = 0;

  // ajuste manual (estilo GameMaker: x/y + xscale/yscale) — arma e espada separados
  debug = false;
  alvo: 'arma' | 'espada' = 'arma';
  wpnOffX = -111;
  wpnOffY = 3;
  wpnScaleX = 1;
  wpnScaleY = 1;
  swOffX = 0;
  swOffY = 0;
  swScaleX = 1;
  swScaleY = 1;
  private readonly wpnBase = 0.56;

  num(e: Event): number { return +(e.target as HTMLInputElement).value; }

  private img: Record<string, HTMLImageElement[]> = {};
  private imgRed: Record<string, HTMLCanvasElement[]> = {};
  private hurt = 0;
  private ready = false;
  private last = 0;

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    const c = this.cv.nativeElement;
    c.width = this.W; c.height = this.H;
    this.ctx = c.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;

    this.carregar().then(() => {
      this.ready = true;
      this.zone.runOutsideAngular(() => {
        this.last = performance.now();
        this.raf = requestAnimationFrame(t => this.loop(t));
      });
    });

    window.addEventListener('keydown', this.onKey);
    window.addEventListener('keyup', this.onKey);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('keyup', this.onKey);
  }

  private async carregar(): Promise<void> {
    const base = 'assets/game/';
    const load = (p: string) => new Promise<HTMLImageElement>(res => {
      const im = new Image(); im.onload = () => res(im); im.onerror = () => res(im); im.src = base + p;
    });
    const seq = async (dir: string, name: string, n: number) =>
      Promise.all(Array.from({ length: n }, (_, i) => load(`${dir}/${name}_${i}.png`)));

    this.img['ew'] = await seq('enemy', 'walk', 7);
    this.img['ea'] = await seq('enemy', 'attack', 4);
    this.img['ed'] = await seq('enemy', 'die', 13);
    this.img['pw'] = await seq('player', 'walk', 4);
    this.img['ps'] = await seq('player', 'shoot', 6);
    this.img['plo'] = await seq('player', 'lower', 9);
    this.img['pbl'] = await seq('player', 'blade', 6);
    this.img['fb'] = await seq('fx', 'fireball', 8);

    // versões vermelhas do inimigo (flash de dano)
    for (const k of ['ew', 'ea', 'ed']) {
      this.imgRed[k] = this.img[k].map(im => this.tint(im));
    }
  }

  private tint(im: HTMLImageElement): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = Math.max(1, im.width); c.height = Math.max(1, im.height);
    const x = c.getContext('2d')!;
    if (im.width) x.drawImage(im, 0, 0);
    x.globalCompositeOperation = 'source-atop';
    x.fillStyle = 'rgba(255,45,45,0.65)';
    x.fillRect(0, 0, c.width, c.height);
    x.globalCompositeOperation = 'source-over';
    return c;
  }

  private onKey = (e: KeyboardEvent) => {
    if (!this.ativo) return;
    const k = e.key.toLowerCase();
    const jogo = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' ', 'f'];
    if (jogo.includes(k)) e.preventDefault();
    if (e.type === 'keydown') {
      this.keys[k] = true;
      if (k === ' ') this.atirar();
      if (k === 'f') this.espada();
    } else {
      this.keys[k] = false;
    }
  };

  focar(): void { this.ativo = true; this.cv.nativeElement.focus(); }
  desfocar(): void { this.ativo = false; }

  private cell(x: number, y: number): boolean {
    const gx = Math.floor(x), gy = Math.floor(y);
    if (gx < 0 || gy < 0 || gy >= this.MS || gx >= this.MAP[0].length) return true;
    return this.MAP[gy][gx] === '#';
  }

  private atirar(): void {
    if (this.wpn.state !== 'idle' || this.player.ammo <= 0) return;
    this.player.ammo--;
    this.wpn.state = 'shoot'; this.wpn.frame = 0; this.wpn.ft = 0; this.wpn.hit = false;
    this.acertarInimigo(6, 25);
  }
  private espada(): void {
    if (this.wpn.state !== 'idle') return;
    this.wpn.state = 'sword'; this.wpn.frame = 0; this.wpn.ft = 0; this.wpn.hit = false;
  }

  private acertarInimigo(alcance: number, dano: number): void {
    if (this.enemy.state === 'dead' || this.enemy.state === 'dying') return;
    const dx = this.enemy.x - this.player.x, dy = this.enemy.y - this.player.y;
    const dist = Math.hypot(dx, dy);
    if (dist > alcance) return;
    let a = Math.atan2(dy, dx) - this.player.ang;
    while (a > Math.PI) a -= 2 * Math.PI;
    while (a < -Math.PI) a += 2 * Math.PI;
    // só acerta se o inimigo estiver sob a mira (+): compara com a meia-largura angular dele
    const meia = Math.atan2(0.5, dist);
    if (Math.abs(a) < meia) {
      this.enemy.hp -= dano;
      this.hurt = 0.14;
      if (this.enemy.hp <= 0) { this.enemy.state = 'dying'; this.enemy.frame = 0; this.enemy.ft = 0; }
    }
  }

  private loop(t: number): void {
    const dt = Math.min(0.05, (t - this.last) / 1000); this.last = t;
    this.update(dt);
    this.render();
    this.raf = requestAnimationFrame(n => this.loop(n));
  }

  private update(dt: number): void {
    const p = this.player;
    const mv = 3 * dt, rot = 2.6 * dt;
    if (this.keys['arrowleft'] || this.keys['a']) p.ang -= rot;
    if (this.keys['arrowright'] || this.keys['d']) p.ang += rot;
    const fwd = (this.keys['arrowup'] || this.keys['w'] ? 1 : 0) - (this.keys['arrowdown'] || this.keys['s'] ? 1 : 0);
    if (fwd) {
      const nx = p.x + Math.cos(p.ang) * mv * fwd;
      const ny = p.y + Math.sin(p.ang) * mv * fwd;
      if (!this.cell(nx, p.y)) p.x = nx;
      if (!this.cell(p.x, ny)) p.y = ny;
    }
    const andando = fwd !== 0;
    if (andando) this.bob += dt * 9; else this.bob = 0;

    // arma
    if (this.wpn.state === 'shoot') {
      this.wpn.ft += dt;
      if (this.wpn.ft > 0.05) { this.wpn.ft = 0; this.wpn.frame++; if (this.wpn.frame >= 6) this.wpn.state = 'idle'; }
    } else if (this.wpn.state === 'sword') {
      // 0..5 abaixa a arma | 6..11 golpe da espada | 12..14 arma volta
      this.wpn.ft += dt;
      if (this.wpn.ft > 0.04) {
        this.wpn.ft = 0; this.wpn.frame++;
        if (this.wpn.frame === 10 && !this.wpn.hit) { this.wpn.hit = true; this.acertarInimigo(1.6, 60); }
        if (this.wpn.frame >= 15) this.wpn.state = 'idle';
      }
    } else if (andando) {
      this.wpn.ft += dt;
      if (this.wpn.ft > 0.12) { this.wpn.ft = 0; this.wpn.frame = (this.wpn.frame + 1) % 4; }
    } else {
      this.wpn.frame = 0;
    }

    // inimigo
    const e = this.enemy;
    const dx = p.x - e.x, dy = p.y - e.y, dist = Math.hypot(dx, dy);
    if (e.state === 'dying') {
      e.ft += dt;
      if (e.ft > 0.06) { e.ft = 0; e.frame++; if (e.frame >= 12) { e.frame = 12; e.state = 'dead'; } }
    } else if (e.state !== 'dead') {
      if (dist > 2.5) {
        e.state = 'walk';
        const s = 1.3 * dt;
        const nx = e.x + (dx / dist) * s, ny = e.y + (dy / dist) * s;
        if (!this.cell(nx, e.y)) e.x = nx;
        if (!this.cell(e.x, ny)) e.y = ny;
        e.ft += dt; if (e.ft > 0.1) { e.ft = 0; e.frame = (e.frame + 1) % 7; }
      } else {
        e.state = 'attack';
        e.ft += dt; if (e.ft > 0.12) { e.ft = 0; e.frame = (e.frame + 1) % 4; }
        e.atkCd -= dt;
        if (e.atkCd <= 0) {
          e.atkCd = 1.6;
          const d = Math.hypot(dx, dy) || 1;
          this.fireballs.push({ x: e.x, y: e.y, dx: dx / d, dy: dy / d, frame: 0, ft: 0 });
        }
      }
    }

    if (this.hurt > 0) this.hurt = Math.max(0, this.hurt - dt);

    // fireballs
    this.fbAnim += dt;
    for (const f of this.fireballs) {
      f.x += f.dx * 4 * dt; f.y += f.dy * 4 * dt;
      f.ft += dt; if (f.ft > 0.06) { f.ft = 0; f.frame = (f.frame + 1) % 8; }
    }
    this.fireballs = this.fireballs.filter(f => {
      if (this.cell(f.x, f.y)) return false;
      if (Math.hypot(f.x - p.x, f.y - p.y) < 0.4) { p.hp = Math.max(0, p.hp - 10); return false; }
      return true;
    });
  }

  private enemyImg(): Pic | null {
    const e = this.enemy;
    if (e.state === 'dead') return this.img['ed'][12];
    if (e.state === 'dying') return this.img['ed'][e.frame];
    const flash = this.hurt > 0;
    if (e.state === 'attack') { const i = e.frame % 4; return flash ? this.imgRed['ea'][i] : this.img['ea'][i]; }
    const i = e.frame % 7; return flash ? this.imgRed['ew'][i] : this.img['ew'][i];
  }
  wpnImg(): HTMLImageElement | null {
    if (this.wpn.state === 'shoot') return this.img['ps'][Math.min(this.wpn.frame, 5)];
    if (this.wpn.state === 'sword') {
      const f = this.wpn.frame;
      if (f < 6) return this.img['plo'][f];              // abaixa (0..5)
      if (f < 12) return this.img['pbl'][f - 6];         // espada (6..11)
      return this.img['plo'][f - 6];                     // volta (12..14 -> lower 6..8)
    }
    return this.img['pw'][this.wpn.frame % 4];
  }

  private render(): void {
    const ctx = this.ctx, W = this.W, H = this.H, p = this.player;
    const bobV = Math.sin(this.bob) * 3;
    const horizon = H / 2 + bobV;
    // céu/chão
    ctx.fillStyle = '#0b140d'; ctx.fillRect(0, 0, W, horizon);
    ctx.fillStyle = '#05080a'; ctx.fillRect(0, horizon, W, H - horizon);

    const dirX = Math.cos(p.ang), dirY = Math.sin(p.ang);
    const planeX = -dirY * 0.66, planeY = dirX * 0.66;
    const zbuf = new Array(W);

    for (let x = 0; x < W; x++) {
      const camX = 2 * x / W - 1;
      const rdx = dirX + planeX * camX, rdy = dirY + planeY * camX;
      let mx = Math.floor(p.x), my = Math.floor(p.y);
      const ddx = Math.abs(1 / rdx), ddy = Math.abs(1 / rdy);
      let sx: number, sy: number, sdx: number, sdy: number;
      if (rdx < 0) { sx = -1; sdx = (p.x - mx) * ddx; } else { sx = 1; sdx = (mx + 1 - p.x) * ddx; }
      if (rdy < 0) { sy = -1; sdy = (p.y - my) * ddy; } else { sy = 1; sdy = (my + 1 - p.y) * ddy; }
      let side = 0, hit = false;
      for (let g = 0; g < 64 && !hit; g++) {
        if (sdx < sdy) { sdx += ddx; mx += sx; side = 0; } else { sdy += ddy; my += sy; side = 1; }
        if (this.cell(mx + 0.5, my + 0.5)) hit = true;
      }
      const perp = side === 0 ? (sdx - ddx) : (sdy - ddy);
      zbuf[x] = perp;
      const lh = Math.min(H * 4, H / perp);
      const y0 = Math.max(0, horizon - lh / 2);
      const sh = Math.max(0, Math.min(H, horizon + lh / 2) - y0);
      const base = side === 1 ? 90 : 130;
      const shade = Math.max(30, base - perp * 12);
      ctx.fillStyle = `rgb(${Math.floor(shade * 0.5)},${Math.floor(shade)},${Math.floor(shade * 0.55)})`;
      ctx.fillRect(x, y0, 1, sh);
    }

    // sprites
    const sprites: Sprite[] = [];
    if (this.enemy.state !== 'dead' || true) {
      sprites.push({ x: this.enemy.x, y: this.enemy.y, img: () => this.enemyImg(), scale: 0.95, ground: true });
    }
    for (const f of this.fireballs) {
      sprites.push({ x: f.x, y: f.y, img: () => this.img['fb'][f.frame], scale: 0.4, ground: false });
    }
    sprites.sort((a, b) =>
      (Math.hypot(b.x - p.x, b.y - p.y)) - (Math.hypot(a.x - p.x, a.y - p.y)));

    const invDet = 1 / (planeX * dirY - dirX * planeY);
    for (const s of sprites) {
      const img = s.img();
      if (!img || !img.width) continue;
      const rx = s.x - p.x, ry = s.y - p.y;
      const tx = invDet * (dirY * rx - dirX * ry);
      const ty = invDet * (-planeY * rx + planeX * ry);
      if (ty <= 0.1) continue;
      const scrX = (W / 2) * (1 + tx / ty);
      const sizeH = Math.abs(H / ty) * s.scale;
      const sizeW = sizeH * (img.width / img.height);
      const floorY = horizon + Math.abs(H / ty) / 2;
      const y0 = s.ground ? floorY - sizeH : (horizon - sizeH / 2);
      const startX = Math.floor(scrX - sizeW / 2);
      for (let sxp = 0; sxp < sizeW; sxp++) {
        const col = startX + sxp;
        if (col < 0 || col >= W) continue;
        if (ty >= zbuf[col]) continue;
        const texX = Math.floor((sxp / sizeW) * img.width);
        ctx.drawImage(img, texX, 0, 1, img.height, col, y0, 1, sizeH);
      }
    }

    // mira (+) no centro da tela
    ctx.fillStyle = 'rgba(124,240,154,0.9)';
    ctx.fillRect(W / 2 - 4, H / 2, 9, 1);
    ctx.fillRect(W / 2, H / 2 - 4, 1, 9);

    // arma (POV) — x/y + xscale/yscale ajustáveis
    const wi = this.wpnImg();
    if (wi && wi.width) {
      const bx = Math.sin(this.bob) * 5;
      const by = Math.abs(Math.cos(this.bob)) * 4;
      // frames 9..14 do golpe são a espada; o resto (inclui abaixar a arma) usa o ajuste da arma
      const esp = this.wpn.state === 'sword' && this.wpn.frame >= 6 && this.wpn.frame < 12;
      const ox = esp ? this.swOffX : this.wpnOffX;
      const oy = esp ? this.swOffY : this.wpnOffY;
      const sxx = esp ? this.swScaleX : this.wpnScaleX;
      const syy = esp ? this.swScaleY : this.wpnScaleY;
      // espada foi desenhada pra ocupar a tela inteira; a arma usa base menor
      const baseW = W * (esp ? 1 : this.wpnBase);
      const dw = baseW * sxx;
      const dh = baseW * (wi.height / wi.width) * syy;
      const dx = (W - dw) / 2 + ox + bx;
      const dy = H - dh + oy + by;
      ctx.drawImage(wi, dx, dy, dw, dh);
    }

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, H - 16, W, 16);
    ctx.fillStyle = '#7CF09A'; ctx.font = '9px monospace';
    ctx.fillText('HP ' + p.hp, 6, H - 5);
    ctx.fillText('AMMO ' + p.ammo, 70, H - 5);
    if (this.enemy.state === 'dead') {
      ctx.fillStyle = '#e6fff0'; ctx.fillText('INIMIGO ABATIDO', W - 132, H - 5);
    }
    if (!this.ativo) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#eafff0'; ctx.font = '11px monospace';
      ctx.fillText('CLIQUE PARA JOGAR', W / 2 - 60, H / 2);
      ctx.font = '8px monospace';
      ctx.fillText('WASD/setas mover  ESPACO atira  F espada', 18, H / 2 + 16);
    }
  }

  reiniciar(): void {
    this.player = { x: 8, y: 8, ang: 0, hp: 100, ammo: 30 };
    this.enemy = { x: 8, y: 3, hp: 100, state: 'walk', frame: 0, ft: 0, atkCd: 0 };
    this.hurt = 0;
    this.fireballs = [];
    this.wpn = { state: 'idle', frame: 0, ft: 0, hit: false };
  }
}
