import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class IdleService {
    private timeout: any;
    private idleTime = 10 * 60 * 1000; // 10 minutes (10 min * 60 sec * 1000 ms)

    constructor(
        private authService: AuthService,
        private router: Router,
        private ngZone: NgZone
    ) {
        this.startWatching();
    }

    private startWatching() {
        // Server-side rendering check
        if (typeof window === 'undefined') {
            return;
        }

        //  Listen to user activity events
        this.ngZone.runOutsideAngular(() => {
            ['mousemove', 'keydown', 'click'].forEach(event =>
                window.addEventListener(event, () => this.resetTimer())
            );
        });

        this.resetTimer();
    }

    private resetTimer() {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.ngZone.run(() => {
                this.logoutUser();
            });
        }, this.idleTime);
    }

    private logoutUser() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
