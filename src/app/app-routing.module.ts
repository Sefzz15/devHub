import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from '../services/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';

import { FirstpageComponent } from './components/firstpage/firstpage.component';
import { CreateUserComponent } from './components/firstpage/create-user/create-user.component';
import { UpdateUserComponent } from './components/firstpage/update-user/update-user.component';

import { CreateCustomerComponent } from './components/firstpage/create-customer/create-customer.component';
import { UpdateCustomerComponent } from './components/firstpage/update-customer/update-customer.component';

import { ThirdpageComponent } from './components/thirdpage/thirdpage.component';
import { CreateProductComponent } from './components/firstpage/create-product/create-product.component';
import { UpdateProductComponent } from './components/firstpage/update-product/update-product.component';
import { CreateOrderComponent } from './components/firstpage/create-order/create-order.component';
import { UpdateOrderComponent } from './components/firstpage/update-order/update-order.component';
import { CreateOrderdetailComponent } from './components/firstpage/create-orderdetail/create-orderdetail.component';
import { UpdateOrderdetailComponent } from './components/firstpage/update-orderdetail/update-orderdetail.component';

import { ChatComponent } from './components/chat/chat.component';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'navbar', component: NavbarComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'firstpage', component: FirstpageComponent, canActivate: [AuthGuard] },
  { path: 'firstpage/create-user', component: CreateUserComponent },
  { path: 'firstpage/update-user/:id', component: UpdateUserComponent, canActivate: [AuthGuard] },
  { path: 'firstpage/create-customer', component: CreateCustomerComponent },
  { path: 'firstpage/update-customer/:id', component: UpdateCustomerComponent, canActivate: [AuthGuard] },
  { path: 'firstpage/create-product', component: CreateProductComponent, canActivate: [AuthGuard] },
  { path: 'firstpage/update-product/:id', component: UpdateProductComponent, canActivate: [AuthGuard] },
  { path: 'firstpage/create-order', component: CreateOrderComponent, canActivate: [AuthGuard] },
  { path: 'firstpage/update-order/:id', component: UpdateOrderComponent, canActivate: [AuthGuard] },
  { path: 'firstpage/create-orderdetail', component: CreateOrderdetailComponent, canActivate: [AuthGuard] },
  { path: 'firstpage/update-orderdetail/:id', component: UpdateOrderdetailComponent, canActivate: [AuthGuard] },
  { path: 'thirdpage', component: ThirdpageComponent, canActivate: [AuthGuard] },


  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
