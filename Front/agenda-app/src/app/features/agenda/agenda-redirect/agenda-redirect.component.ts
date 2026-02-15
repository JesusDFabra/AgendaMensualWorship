import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agenda-redirect',
  standalone: true,
  template: `<p class="p-4 text-stone-500 dark:text-stone-400 text-sm">Redirigiendo al mes actual…</p>`,
})
export class AgendaRedirectComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12
    this.router.navigate(['/agenda', 'mes', year, month], { replaceUrl: true });
  }
}
