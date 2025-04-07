import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../../services/customer.service';
import { ProductService } from '../../../services/product.service';
import { OrderService } from '../../../services/order.service';
import { forkJoin } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-thirdpage',
  templateUrl: './thirdpage.component.html',
  styleUrls: ['../firstpage/firstpage.component.css'],
})
export class ThirdpageComponent implements OnInit {
  customers: any[] = [];
  products: any[] = [];
  orders: any[] = [];
  datas: any[] = [];

  constructor(
    private customerService: CustomerService,
    private productService: ProductService,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    forkJoin({
      products: this.productService.getProducts(),
      orders: this.orderService.getOrders(),
      customers: this.customerService.getCustomers(),
    }).subscribe({
      next: (data) => {
        // this.products = data.products.$values;
        // this.orders = data.orders.$values;
        // this.customers = data.customers.$values;
        console.log("Fetched products:", data);


      },
      error: (error) => {
        console.error('Error fetching datam:', error);
      }
    });
  }
}
