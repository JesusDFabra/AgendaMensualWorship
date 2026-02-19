import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandService } from '../../core/services/brand.service';
import { MemberService, Member } from '../../core/services/member.service';

export type BirthdayEntry = {
  member: Member;
  nextDate: Date;
  daysUntil: number;
};

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  loadingBirthdays = signal(true);
  upcomingBirthdays = signal<BirthdayEntry[]>([]);

  constructor(
    public brand: BrandService,
    private memberService: MemberService,
  ) {}

  ngOnInit(): void {
    this.memberService.getAll().subscribe({
      next: (members) => {
        this.upcomingBirthdays.set(this.computeUpcomingBirthdays(members));
        this.loadingBirthdays.set(false);
      },
      error: () => this.loadingBirthdays.set(false),
    });
  }

  /** Próximos 30 días: cumpleaños ordenados por fecha. */
  private computeUpcomingBirthdays(members: Member[]): BirthdayEntry[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limit = new Date(today);
    limit.setDate(limit.getDate() + 30);

    const entries: BirthdayEntry[] = [];

    for (const m of members) {
      const birth = this.parseBirthDate(m.fecNacimiento);
      if (!birth) continue;

      const next = this.nextBirthdayDate(birth, today);
      if (next >= today && next <= limit) {
        const daysUntil = Math.floor((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        entries.push({ member: m, nextDate: next, daysUntil });
      }
    }

    entries.sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());
    return entries;
  }

  private parseBirthDate(value: string): { month: number; day: number } | null {
    if (!value || value.length < 10) return null;
    const parts = value.slice(0, 10).split('-');
    if (parts.length !== 3) return null;
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (Number.isNaN(month) || Number.isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) return null;
    return { month, day };
  }

  private nextBirthdayDate(birth: { month: number; day: number }, from: Date): Date {
    const thisYear = new Date(from.getFullYear(), birth.month - 1, birth.day);
    if (thisYear >= from) return thisYear;
    return new Date(from.getFullYear() + 1, birth.month - 1, birth.day);
  }

  formatBirthdayDay(date: Date): string {
    const d = date.getDate();
    const m = date.getMonth();
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${d} ${months[m]}`;
  }

  formatDaysUntil(days: number): string {
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Mañana';
    return `En ${days} días`;
  }

  memberDisplay(m: Member): string {
    if (m.alias?.trim()) return `${m.nombre} ${m.apellido} (${m.alias})`;
    return `${m.nombre} ${m.apellido}`.trim();
  }
}
