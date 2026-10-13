import * as PIXI from 'pixi.js';

/**
 * RTS Camera controller for isometric world navigation
 * Supports edge scrolling, keyboard keys (WASD/Arrows), middle drag, and zoom
 */
export class Camera {
  public x: number = 0;
  public y: number = 0;
  public zoom: number = 1.0;
  public minZoom: number = 0.5;
  public maxZoom: number = 2.0;

  private moveSpeed: number = 700; // pixels per second
  private edgeThreshold: number = 24; // distance from edge to start scrolling
  private keys: Record<string, boolean> = {};
  private isMiddleDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private camStartX: number = 0;
  private camStartY: number = 0;

  private mouseScreenX: number = -1;
  private mouseScreenY: number = -1;

  constructor(private container: PIXI.Container, private viewWidth: number, private viewHeight: number) {
    this.setupListeners();
  }

  private setupListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    window.addEventListener('mousemove', (e) => {
      this.mouseScreenX = e.clientX;
      this.mouseScreenY = e.clientY;

      if (this.isMiddleDragging) {
        const dx = e.clientX - this.dragStartX;
        const dy = e.clientY - this.dragStartY;
        this.x = this.camStartX + dx / this.zoom;
        this.y = this.camStartY + dy / this.zoom;
      }
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 1) { // Middle click
        this.isMiddleDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.camStartX = this.x;
        this.camStartY = this.y;
        e.preventDefault();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 1) {
        this.isMiddleDragging = false;
      }
    });

    window.addEventListener('wheel', (e) => {
      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      this.applyZoom(zoomFactor, e.clientX, e.clientY);
    }, { passive: true });
  }

  public resize(width: number, height: number) {
    this.viewWidth = width;
    this.viewHeight = height;
  }

  public applyZoom(factor: number, screenCenterX?: number, screenCenterY?: number) {
    const cx = screenCenterX ?? this.viewWidth / 2;
    const cy = screenCenterY ?? this.viewHeight / 2;

    const oldZoom = this.zoom;
    const newZoom = Math.min(this.maxZoom, Math.max(this.minZoom, oldZoom * factor));

    if (newZoom === oldZoom) return;

    // Zoom toward point
    const worldPointX = (cx - this.viewWidth / 2) / oldZoom - this.x;
    const worldPointY = (cy - this.viewHeight / 2) / oldZoom - this.y;

    this.zoom = newZoom;
    this.x = (cx - this.viewWidth / 2) / newZoom - worldPointX;
    this.y = (cy - this.viewHeight / 2) / newZoom - worldPointY;
  }

  /**
   * Center camera on isometric grid coordinate
   */
  public centerOn(worldX: number, worldY: number) {
    this.x = -worldX;
    this.y = -worldY;
  }

  public update(deltaSeconds: number) {
    let moveX = 0;
    let moveY = 0;

    // Keyboard navigation
    if (this.keys['w'] || this.keys['arrowup']) moveY += 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveY -= 1;
    if (this.keys['a'] || this.keys['arrowleft']) moveX += 1;
    if (this.keys['d'] || this.keys['arrowright']) moveX -= 1;

    // Edge scrolling (only if cursor inside window)
    if (this.mouseScreenX >= 0 && this.mouseScreenY >= 0) {
      if (this.mouseScreenX < this.edgeThreshold) moveX += 1;
      else if (this.mouseScreenX > this.viewWidth - this.edgeThreshold) moveX -= 1;

      if (this.mouseScreenY < this.edgeThreshold + 38) moveY += 1; // beneath top bar
      else if (this.mouseScreenY > this.viewHeight - this.edgeThreshold - 150) moveY -= 1; // above bottom HUD
    }

    if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY);
      const speed = (this.moveSpeed / this.zoom) * deltaSeconds;
      this.x += (moveX / len) * speed;
      this.y += (moveY / len) * speed;
    }

    // Apply transformation to Pixi container
    this.container.position.set(
      this.viewWidth / 2 + this.x * this.zoom,
      this.viewHeight / 2 + this.y * this.zoom
    );
    this.container.scale.set(this.zoom);
  }

  /**
   * Converts viewport client coordinates (clientX, clientY) to world coordinates
   */
  public screenToWorld(clientX: number, clientY: number): { x: number; y: number } {
    return {
      x: (clientX - this.viewWidth / 2) / this.zoom - this.x,
      y: (clientY - this.viewHeight / 2) / this.zoom - this.y
    };
  }

  /**
   * Converts world coordinates to viewport screen coordinates
   */
  public worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: (worldX + this.x) * this.zoom + this.viewWidth / 2,
      y: (worldY + this.y) * this.zoom + this.viewHeight / 2
    };
  }
}
