import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from '../services/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FirstpageComponent } from './components/firstpage/firstpage.component';
import { SecondpageComponent } from './components/secondpage/secondpage.component';
import { CreateUserComponent } from './components/firstpage/create-user/create-user.component';
import { UpdateUserComponent } from './components/firstpage/update-user/update-user.component';
import { CreateCustomerComponent } from './components/secondpage/create-customer/create-customer.component';
import { UpdateCustomerComponent } from './components/secondpage/update-customer/update-customer.component';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'navbar', component: NavbarComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'firstpage', component: FirstpageComponent, canActivate: [AuthGuard] },
  { path: 'firstpage/create-user', component: CreateUserComponent },
  { path: 'firstpage/update-user/:id', component: UpdateUserComponent, canActivate: [AuthGuard] },  // Match dynamic route here
  { path: 'secondpage', component: SecondpageComponent, canActivate: [AuthGuard] },
  { path: 'secondpage/create-customer', component: CreateCustomerComponent },
  { path: 'secondpage/update-customer/:id', component: UpdateCustomerComponent, canActivate: [AuthGuard] },  // Match dynamic route here
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
