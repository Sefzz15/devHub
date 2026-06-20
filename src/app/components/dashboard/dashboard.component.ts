import {Component, OnInit, signal} from '@angular/core';
import { SessionService } from '../../../services/session.service';

/** A navigable feature shown as a card on the dashboard. */
interface DashboardFeature {
  icon: string;
  route: string;
  color: string;
  titleKey: string;
  bodyKey: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,

  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  readonly userID = signal(0);
  readonly username = signal('');

  /** Cards rendered in the dashboard grid; order mirrors the navbar. */
  readonly features: DashboardFeature[] = [
    { icon: 'admin_panel_settings', route: '/admin',         color: '#3e4684', titleKey: 'dashboard.adminTitle',    bodyKey: 'dashboard.adminBody' },
    { icon: 'shopping_cart',        route: '/shop',          color: '#2a9d8f', titleKey: 'dashboard.shopTitle',     bodyKey: 'dashboard.shopBody' },
    { icon: 'receipt_long',         route: '/order-history', color: '#e09f3e', titleKey: 'dashboard.orderTitle',    bodyKey: 'dashboard.orderBody' },
    { icon: 'movie',                route: '/cinema',        color: '#c1453b', titleKey: 'dashboard.cinemaTitle',   bodyKey: 'dashboard.cinemaBody' },
    { icon: 'view_in_ar',           route: '/rubiks-cube',   color: '#7b5ea7', titleKey: 'dashboard.rubiksTitle',   bodyKey: 'dashboard.rubiksBody' },
    { icon: 'forum',                route: '/chat',          color: '#2f6fb0', titleKey: 'dashboard.chatTitle',     bodyKey: 'dashboard.chatBody' },
    { icon: 'music_note',           route: '/spotify',       color: '#2e7d32', titleKey: 'dashboard.spotifyTitle',  bodyKey: 'dashboard.spotifyBody' },
    { icon: 'rate_review',          route: '/feedback',      color: '#d6336c', titleKey: 'dashboard.feedbackTitle', bodyKey: 'dashboard.feedbackBody' },
  ];

  constructor(
    private _sessionService: SessionService,
  ) { }

  ngOnInit(): void {
    this.username.set(this._sessionService.username);
    this.userID.set(this._sessionService.userID);

    console.log('Username in Dashboard:', this.username());
    console.log('UserID in Dashboard:', this.userID());
  }
}
