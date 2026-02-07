import { Component, ElementRef, OnInit, OnDestroy, ViewChild, PLATFORM_ID, Inject, Input } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

interface GlobeArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color?: string;
}

@Component({
  selector: 'app-globe',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="globe-container" [style.width.px]="size" [style.height.px]="size">
      <div #globeCanvas class="globe-canvas"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .globe-container {
      position: relative;
      margin: 0 auto;
    }
    .globe-canvas {
      width: 100%;
      height: 100%;
    }
  `]
})
export class GlobeComponent implements OnInit, OnDestroy {
  @ViewChild('globeCanvas', { static: true }) canvasRef!: ElementRef<HTMLDivElement>;
  @Input() size: number = 600;
  @Input() autoRotate: boolean = true;
  @Input() rotationSpeed: number = 0.003;
  
  private renderer?: any;
  private scene?: any;
  private camera?: any;
  private globe?: any;
  private animationId?: number;
  private isBrowser: boolean;
  private THREE?: any;

  private arcs: GlobeArc[] = [
    { startLat: 28.6139, startLng: 77.209, endLat: 51.5074, endLng: -0.1278, color: '#818cf8' },
    { startLat: 40.7128, startLng: -74.006, endLat: 35.6762, endLng: 139.6503, color: '#6366f1' },
    { startLat: -33.8688, startLng: 151.2093, endLat: 48.8566, endLng: 2.3522, color: '#4f46e5' },
    { startLat: 1.3521, startLng: 103.8198, endLat: 40.4168, endLng: -3.7038, color: '#818cf8' },
    { startLat: -23.5505, startLng: -46.6333, endLat: 55.7558, endLng: 37.6173, color: '#6366f1' },
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadAndInitGlobe();
    }
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private async loadAndInitGlobe(): Promise<void> {
    // Dynamically import THREE and ThreeGlobe only in browser
    const [THREE, ThreeGlobeModule] = await Promise.all([
      import('three'),
      import('three-globe')
    ]);
    
    this.THREE = THREE;
    const ThreeGlobe = ThreeGlobeModule.default;
    
    this.initGlobe(THREE, ThreeGlobe);
  }

  private initGlobe(THREE: any, ThreeGlobe: any): void {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent background

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(50, 1, 180, 1800);
    this.camera.position.z = 400;

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(this.size, this.size);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.canvasRef.nativeElement.appendChild(this.renderer.domElement);

    // Globe setup with bright Earth texture for light mode
    this.globe = new ThreeGlobe({
      waitForGlobeReady: true,
      animateIn: true,
    })
      .globeImageUrl('https://unpkg.com/three-globe@2.31.1/example/img/earth-day.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png')
      .showAtmosphere(true)
      .atmosphereColor('#a5b4fc')
      .atmosphereAltitude(0.2)
      .arcsData(this.arcs)
      .arcColor('color')
      .arcDashLength(0.4)
      .arcDashGap(0.2)
      .arcDashAnimateTime(3000)
      .arcStroke(0.8)
      .arcAltitude(0.2)
      .arcsTransitionDuration(1000);

    // Material enhancements for light mode
    const globeMaterial = this.globe.globeMaterial();
    globeMaterial.bumpScale = 8;
    globeMaterial.shininess = 0.8;
    globeMaterial.emissive = new THREE.Color('#ffffff');
    globeMaterial.emissiveIntensity = 0.05;

    this.scene.add(this.globe);

    // Enhanced lighting setup for light mode
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 3, 5);
    this.scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xa5b4fc, 0.4);
    backLight.position.set(-5, -3, -5);
    this.scene.add(backLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.6);
    pointLight.position.set(-200, 500, 200);
    this.scene.add(pointLight);

    // Start animation
    this.animate();
  }

  private animate = (): void => {
    if (!this.renderer || !this.scene || !this.camera || !this.globe) return;

    this.animationId = requestAnimationFrame(this.animate);

    if (this.autoRotate) {
      this.globe.rotation.y += this.rotationSpeed;
    }

    this.renderer.render(this.scene, this.camera);
  };
}
