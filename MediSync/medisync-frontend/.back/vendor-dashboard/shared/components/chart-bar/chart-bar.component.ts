import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-chart-bar',
  templateUrl: './chart-bar.component.html'
})
export class ChartBarComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() series: { label: string; value: number; color: string }[] = [];

  ngAfterViewInit(){ this.draw(); }

  private draw(){
    const c = this.canvasRef.nativeElement;
    const ctx = c.getContext('2d'); if (!ctx) return;

    const w = c.width, h = c.height, pad = 28;
    ctx.clearRect(0,0,w,h);

    const maxVal = Math.max(1, ...this.series.map(s => s.value));
    const barW = (w - pad*2) / Math.max(1, this.series.length);

    ctx.strokeStyle = 'rgba(16,50,74,.25)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, h - pad); ctx.lineTo(w - pad, h - pad); ctx.stroke();

    ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    this.series.forEach((s, i) => {
      const x = pad + i * barW + 12;
      const usableH = h - pad*2;
      const bh = (s.value / maxVal) * usableH;
      const y = (h - pad) - bh;

      ctx.fillStyle = s.color; ctx.fillRect(x, y, barW - 24, bh);
      ctx.fillStyle = 'rgba(16,50,74,.9)';
      ctx.fillText(s.label, x, h - pad + 16);
      ctx.fillText(String(s.value), x, y - 6);
    });
  }
}