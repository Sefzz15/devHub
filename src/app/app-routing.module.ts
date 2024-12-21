import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { FirstpageComponent } from './components/firstpage/firstpage.component';
import { SecondpageComponent } from './components/secondpage/secondpage.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AuthGuard } from '../services/auth.guard';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },

  { path: 'firstpage', component: FirstpageComponent, canActivate: [AuthGuard]  },
  { path: 'secondpage', component: SecondpageComponent, canActivate: [AuthGuard]  },
  { path: 'navbar', component: NavbarComponent, canActivate: [AuthGuard]  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
