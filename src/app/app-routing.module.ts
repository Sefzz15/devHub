import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from '../services/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';

import { AdminpageComponent } from './components/admin/admin.component';

import { CreateUserComponent } from './components/admin/create-user/create-user.component';
import { UpdateUserComponent } from './components/admin/update-user/update-user.component';


import { CreateProductComponent } from './components/admin/create-product/create-product.component';
import { UpdateProductComponent } from './components/admin/update-product/update-product.component';

import { CreateOrderComponent } from './components/admin/create-order/create-order.component';
import { UpdateOrderComponent } from './components/admin/update-order/update-order.component';


import { ShoppageComponent } from './components/shop/shop.component';
import { OrderHistoryComponent } from './components/order-history/order-history';

import { ChatComponent } from './components/chat/chat.component';
import { MultistepformComponent } from './components/multistepform/multistepform.component';
import { SpotifyComponent } from './components/spotify/spotify.component';
import { RubiksCubeComponent } from './components/rubiks-cube/rubiks-cube.component';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // { path: 'navbar', component: NavbarComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'adminpage', component: AdminpageComponent, canActivate: [AuthGuard] },
  { path: 'adminpage/create-user', component: CreateUserComponent },
  { path: 'adminpage/update-user/:id', component: UpdateUserComponent, canActivate: [AuthGuard] },
  { path: 'adminpage/create-product', component: CreateProductComponent, canActivate: [AuthGuard] },
  { path: 'adminpage/update-product/:id', component: UpdateProductComponent, canActivate: [AuthGuard] },
  { path: 'adminpage/create-order', component: CreateOrderComponent, canActivate: [AuthGuard] },
  { path: 'adminpage/update-order/:id', component: UpdateOrderComponent, canActivate: [AuthGuard] },
  { path: 'shop', component: ShoppageComponent, canActivate: [AuthGuard] },
  { path: 'order-history', component: OrderHistoryComponent, canActivate: [AuthGuard] },
  { path: 'spotify', component: SpotifyComponent, canActivate: [AuthGuard] },
  { path: 'rubiks-cube', component: RubiksCubeComponent, canActivate: [AuthGuard] },

  { path: 'multistepform', component: MultistepformComponent, canActivate: [AuthGuard] },
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
