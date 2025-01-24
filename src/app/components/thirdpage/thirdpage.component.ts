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
    // Fetch all necessary data in parallel
    forkJoin({
      products: this.productService.getProducts(),
      orders: this.orderService.getOrders(),
      customers: this.customerService.getCustomers(),
    }).subscribe({
      next: (data) => {
        this.products = data.products;
        this.orders = data.orders;
        this.customers = data.customers;

      },
      error: (error) => {
        console.error('Error fetching data:', error);
      }
    });
  }

  // Utility function to get customer name by ID
  private getCustomerName(cid: number): string {
    const customer = this.customers.find(c => c.cid === cid);
    return customer ? customer.firstname : 'Unknown';
  }

  // Utility function to get product by ID
  private getProductById(pid: number): any {
    return this.products.find(product => product.pid === pid) || null;
  }

}
