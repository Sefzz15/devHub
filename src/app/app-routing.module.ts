import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from '../services/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';

import { AdminpageComponent } from './components/admin/admin.component';


import { ShoppageComponent } from './components/shop/shop.component';
import { OrderHistoryComponent } from './components/order-history/order-history';

import { ChatComponent } from './components/chat/chat.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { SpotifyComponent } from './components/spotify/spotify.component';
import { RubiksCubeComponent } from './components/rubiks-cube/rubiks-cube.component';
import { EntityFormComponent } from './components/entity-form/entity-form.component';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // { path: 'navbar', component: NavbarComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'adminpage', component: AdminpageComponent, canActivate: [AuthGuard] },

  { path: 'shop', component: ShoppageComponent, canActivate: [AuthGuard] },
  { path: 'order-history', component: OrderHistoryComponent, canActivate: [AuthGuard] },
  { path: 'spotify', component: SpotifyComponent, canActivate: [AuthGuard] },
  { path: 'rubiks-cube', component: RubiksCubeComponent, canActivate: [AuthGuard] },

  { path: 'feedback', component: FeedbackComponent, canActivate: [AuthGuard] },
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },

  { path: 'entity-form/:type', component: EntityFormComponent, canActivate: [AuthGuard] },
  { path: 'entity-form/:type/:id', component: EntityFormComponent, canActivate: [AuthGuard] },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
