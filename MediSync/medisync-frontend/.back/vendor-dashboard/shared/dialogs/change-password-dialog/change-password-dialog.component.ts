import { Component, ElementRef, ViewChild } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss']
})
export class ChangePasswordDialogComponent {
  @ViewChild('dlg', { static: true }) dlg!: ElementRef<HTMLDialogElement>;

  pw0 = ''; pw1 = ''; pw2 = '';
  err0 = ''; err1 = ''; err2 = '';
  pw0Shown = false; pw1Shown = false; pw2Shown = false;

  get score(){ return this.strengthScore(this.pw1); }

  open(){
    const d = this.dlg.nativeElement;
    (d as any).showModal ? d.showModal() : d.setAttribute('open','');
    setTimeout(() => d.querySelector('input')?.focus(), 0);
  }
  close(){
    const d = this.dlg.nativeElement;
    d.close ? d.close('cancel') : d.removeAttribute('open');
    this.pw0 = this.pw1 = this.pw2 = '';
    this.err0 = this.err1 = this.err2 = '';
    this.pw0Shown = this.pw1Shown = this.pw2Shown = false;
  }

  toggle(which: 'pw0'|'pw1'|'pw2'){
    if (which==='pw0') this.pw0Shown = !this.pw0Shown;
    if (which==='pw1') this.pw1Shown = !this.pw1Shown;
    if (which==='pw2') this.pw2Shown = !this.pw2Shown;
    const el = this.dlg.nativeElement.querySelector<HTMLInputElement>('#'+which);
    if (el) el.type = (which==='pw0' ? this.pw0Shown : which==='pw1' ? this.pw1Shown : this.pw2Shown) ? 'text' : 'password';
  }

  private strengthScore(p: string){
    if (!p) return 0;
    const minLen = 12; let s = 0;
    s += Math.min(35, (p.length/minLen)*35);
    const cats = [/[a-z]/.test(p), /[A-Z]/.test(p), /[0-9]/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
    s += cats * 12;
    if (/^(.)\1{7,}$/.test(p)) s -= 25;
    const common = ['password','123456','qwerty','admin','letmein','welcome'];
    if (common.some(w => p.toLowerCase().includes(w))) s -= 20;
    return Math.max(0, Math.min(100, Math.round(s)));
  }

  private validate(): boolean {
    this.err0 = this.err1 = this.err2 = '';
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/;

    if (!this.pw0) this.err0 = 'Current password is required.';
    if (!this.pw1) this.err1 = 'New password is required.';
    else if (!strong.test(this.pw1)) this.err1 = 'Use 12+ chars incl. upper, lower and a number.';
    if (!this.pw2) this.err2 = 'Please confirm your new password.';
    else if (this.pw1 && this.pw2 !== this.pw1) this.err2 = 'Passwords do not match.';
    if (this.pw0 && this.pw1 && this.pw0 === this.pw1) this.err1 = 'New password must be different from current password.';

    return !(this.err0 || this.err1 || this.err2);
  }

  constructor(private toast: ToastService) {}

  onSubmit(){
    if (!this.validate()) return;
    // call API here if needed
    this.toast.show('Password updated', 'Demo: password change validated.');
    this.close();
  }
}
