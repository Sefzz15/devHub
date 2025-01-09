import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../../services/customer.service';
import { ProductService } from '../../../services/product.service';
import { OrderService } from '../../../services/order.service';
import { OrderDetailService } from '../../../services/orderdetail.service';
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
  orderdetails: any[] = [];
  datas: any[] = [];

  constructor(
    private customerService: CustomerService,
    private productService: ProductService,
    private orderService: OrderService,
    private orderdetailService: OrderDetailService
  ) { }

  ngOnInit(): void {
    // Fetch all necessary data in parallel
    forkJoin({
      products: this.productService.getProducts(),
      orders: this.orderService.getOrders(),
      orderdetails: this.orderdetailService.getOrderDetails(),
      customers: this.customerService.getCustomers(),
    }).subscribe({
      next: (data) => {
        this.products = data.products;
        this.orders = data.orders;
        this.orderdetails = data.orderdetails;
        this.customers = data.customers;

        // Get combined order details directly without maps
        this.getCompleteOrderDetails();
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      }
    });
  }

  // Utility function to get customer name by ID
  private getCustomerName(c_id: number): string {
    const customer = this.customers.find(c => c.c_id === c_id);
    return customer ? customer.first_name : 'Unknown';
  }

  // Utility function to get product by ID
  private getProductById(p_id: number): any {
    return this.products.find(product => product.p_id === p_id) || null;
  }

  // Process and combine orders with relevant details
  private getCompleteOrderDetails(): void {
    if (this.customers.length && this.products.length && this.orders.length && this.orderdetails.length) {
      console.log('All data is loaded, processing...');

      this.datas = this.orders.flatMap(order => {
        const matchedOrderDetails = this.orderdetails.filter(orderDetail => orderDetail.o_id === order.o_id);

        return matchedOrderDetails.map(orderDetail => {
          const customerName = this.getCustomerName(order.c_id);
          const product = this.getProductById(orderDetail.p_id);
          const quantity = orderDetail.Quantity || 0;
          const price = product ? product.price : 0;

          return {
            CustomerName: customerName,
            OrderID: order.o_id,
            ProductName: product ? product.p_name : 'Unknown Product',
            Quantity: orderDetail.quantity,
            PricePerUnit: price,
            TotalPriceForProduct: orderDetail.quantity * price,
          };
        });
      });
    } else {
      console.log('Not all data is loaded');
    }
  }
}
