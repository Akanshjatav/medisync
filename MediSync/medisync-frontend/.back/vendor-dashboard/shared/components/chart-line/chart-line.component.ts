import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-chart-line',
  templateUrl: './chart-line.component.html'
})
export class ChartLineComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() points: { x: number; y: number }[] = [];

  ngAfterViewInit(){ this.draw(); }

  private draw(){
    const c = this.canvasRef.nativeElement;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const w = c.width, h = c.height, pad = 28;

    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = 'rgba(16,50,74,.25)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, h - pad); ctx.lineTo(w - pad, h - pad); ctx.stroke();

    if (!this.points.length) return;

    const xs = this.points.map(p => p.x);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = 0, maxY = 100;

    const mapX = (x: number) => pad + ((x - minX) / Math.max(1, (maxX - minX))) * (w - pad*2);
    const mapY = (y: number) => (h - pad) - ((y - minY) / (maxY - minY)) * (h - pad*2);

    ctx.strokeStyle = '#337AB7'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    this.points.forEach((p, i) => { const X = mapX(p.x), Y = mapY(p.y); i===0 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y); });
    ctx.stroke();

    ctx.fillStyle = '#5BC0DE';
    this.points.forEach(p => { const X = mapX(p.x), Y = mapY(p.y); ctx.beginPath(); ctx.arc(X, Y, 3.5, 0, Math.PI*2); ctx.fill(); });

    ctx.fillStyle = 'rgba(16,50,74,.9)';
    ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillText('Last shipments (demo)', pad, pad - 10);
  }
}