import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from '../services/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';

import { FirstpageComponent } from './components/firstpage/firstpage.component';
import { CreateUserComponent } from './components/firstpage/create-user/create-user.component';
import { UpdateUserComponent } from './components/firstpage/update-user/update-user.component';

import { SecondpageComponent } from './components/secondpage/secondpage.component';
import { CreateCustomerComponent } from './components/secondpage/create-customer/create-customer.component';
import { UpdateCustomerComponent } from './components/secondpage/update-customer/update-customer.component';

import { ThirdpageComponent } from './components/thirdpage/thirdpage.component';
import { CreateProductComponent } from './components/thirdpage/create-product/create-product.component';
import { UpdateProductComponent } from './components/thirdpage/update-product/update-product.component';
import { CreateOrderComponent } from './components/thirdpage//create-order/create-order.component';
import { UpdateOrderComponent } from './components/thirdpage/update-order/update-order.component';
import { CreateOrderdetailComponent } from './components/thirdpage/create-orderdetail/create-orderdetail.component';
import { UpdateOrderdetailComponent } from './components/thirdpage/update-orderdetail/update-orderdetail.component';

import { ChatComponent } from './components/chat/chat.component';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'navbar', component: NavbarComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'firstpage', component: FirstpageComponent, canActivate: [AuthGuard] },
  { path: 'firstpage/create-user', component: CreateUserComponent },
  { path: 'firstpage/update-user/:id', component: UpdateUserComponent, canActivate: [AuthGuard] },
  { path: 'secondpage', component: SecondpageComponent, canActivate: [AuthGuard] },
  { path: 'secondpage/create-customer', component: CreateCustomerComponent },
  { path: 'secondpage/update-customer/:id', component: UpdateCustomerComponent, canActivate: [AuthGuard] },
  { path: 'thirdpage', component: ThirdpageComponent, canActivate: [AuthGuard] },
  { path: 'thirdpage/create-product', component: CreateProductComponent, canActivate: [AuthGuard] },
  { path: 'thirdpage/update-product/:id', component: UpdateProductComponent, canActivate: [AuthGuard] },
  { path: 'thirdpage/create-order', component: CreateOrderComponent, canActivate: [AuthGuard] },
  { path: 'thirdpage/update-order/:id', component: UpdateOrderComponent, canActivate: [AuthGuard] },
  { path: 'thirdpage/create-orderdetail', component: CreateOrderdetailComponent, canActivate: [AuthGuard] },
  { path: 'thirdpage/update-orderdetail/:id', component: UpdateOrderdetailComponent, canActivate: [AuthGuard] },

  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
