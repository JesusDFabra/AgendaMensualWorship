import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ServiceAssignmentFormComponent } from '../service-assignment-form/service-assignment-form.component';
import { AdminAuthService } from '../../../core/services/admin-auth.service';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [RouterLink, ServiceAssignmentFormComponent],
  templateUrl: './service-detail.component.html',
  styleUrl: './service-detail.component.scss',
})
export class ServiceDetailComponent implements OnInit {
  servicioId = signal<number | null>(null);

  constructor(
    private route: ActivatedRoute,
    public adminAuth: AdminAuthService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const numId = +id;
      if (!Number.isNaN(numId)) this.servicioId.set(numId);
    }
  }
}
