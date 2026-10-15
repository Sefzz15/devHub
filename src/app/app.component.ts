import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { IdleService } from '../services/idle.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [NavbarComponent, RouterOutlet, FooterComponent],
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'devHub-app';
  private readonly idleService = inject(IdleService);

}
