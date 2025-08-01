import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { NavbarComponent } from './components/navbar/navbar.component';
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
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MultistepformComponent } from './components/multistepform/multistepform.component';
import { RubiksCubeComponent } from './components/rubiks-cube/rubiks-cube.component';
import { SpotifyComponent } from './components/spotify/spotify.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    AdminpageComponent,
    NavbarComponent,
    CreateUserComponent,
    UpdateUserComponent,
    ChatComponent,
    OrderHistoryComponent,
    CreateProductComponent,
    UpdateProductComponent,
    ShoppageComponent,
    CreateOrderComponent,
    UpdateOrderComponent,
    MultistepformComponent,
    RubiksCubeComponent,
    SpotifyComponent,
  ],
  imports: [
    RouterModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MatToolbarModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    AsyncPipe,
    MatIconModule,
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
