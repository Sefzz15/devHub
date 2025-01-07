import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FirstpageComponent } from './components/firstpage/firstpage.component';
import { SecondpageComponent } from './components/secondpage/secondpage.component';
import { NavbarComponent } from './navbar/navbar.component';
import { CreateUserComponent } from './components/firstpage/create-user/create-user.component';
import { UpdateUserComponent } from './components/firstpage/update-user/update-user.component';
import { CreateCustomerComponent } from './components/secondpage/create-customer/create-customer.component';
import { UpdateCustomerComponent } from './components/secondpage/update-customer/update-customer.component';
import { ChatComponent } from './components/chat/chat.component';
import { ThirdpageComponent } from './components/thirdpage/thirdpage.component';
import { CreateProductComponent } from './components/thirdpage/create-product/create-product.component';
import { UpdateProductComponent } from './components/thirdpage/update-product/update-product.component';
import { CreateOrderComponent } from './components/thirdpage/create-order/create-order.component';
import { UpdateOrderComponent } from './components/thirdpage/update-order/update-order.component';
import { CreateOrderdetailComponent } from './components/thirdpage/create-orderdetail/create-orderdetail.component';
import { UpdateOrderdetailComponent } from './components/thirdpage/update-orderdetail/update-orderdetail.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    FirstpageComponent,
    SecondpageComponent,
    NavbarComponent,
    CreateUserComponent,
    UpdateUserComponent,
    CreateCustomerComponent,
    UpdateCustomerComponent,
    ChatComponent,
    ThirdpageComponent,
    CreateProductComponent,
    UpdateProductComponent,
    CreateOrderComponent,
    UpdateOrderComponent,
    CreateOrderdetailComponent,
    UpdateOrderdetailComponent,
  ],
  imports: [
    RouterModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MatToolbarModule,
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
