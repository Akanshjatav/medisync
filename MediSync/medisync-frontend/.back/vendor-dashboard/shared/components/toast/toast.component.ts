import { Component, OnDestroy } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnDestroy {
  isOn = false; title = 'Saved'; message = ''; sub?: Subscription;

  constructor(private toast: ToastService){
    this.sub = this.toast.msg$.subscribe(({ title, message, ms }) => {
      this.title = title || 'Saved'; this.message = message || '';
      this.isOn = true;
      timer(ms ?? 2200).subscribe(() => this.isOn = false);
    });
  }
  ngOnDestroy(){ this.sub?.unsubscribe(); }
}
``