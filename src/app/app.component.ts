import { Component } from '@angular/core';
import { IdleService } from '../services/idle.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'devHub-app';
    constructor(private idleService: IdleService) {}

}
