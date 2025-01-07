import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../../services/customer.service';
import { ProductService } from '../../../services/product.service';
import { OrderService } from '../../../services/order.service';
import { OrderDetailService } from '../../../services/orderdetail.service';

@Component({
  standalone: false,
  selector: 'app-thirdpage',
  templateUrl: './thirdpage.component.html',
  styleUrls: ['../firstpage/firstpage.component.css', './thirdpage.component.css'],
})
export class ThirdpageComponent implements OnInit {
  customers: any[] = [];
  products: any[] = [];
  orders: any[] = [];
  orderdetails: any[] = [];

  constructor(
    private customerService: CustomerService,
    private productService: ProductService,
    private orderService: OrderService,
    private orderdetailService: OrderDetailService
  ) { }

  ngOnInit(): void {
    this.getProducts();
    this.getOrders();
    this.getOrderDetails();
  }

  // Get customers from the API
  getCustomers(): void {
    this.customerService.getCustomers().subscribe(
      (data: any) => {
        this.customers = data;
      },
      (error: any) => {
        console.error('Error fetching customers:', error);
      }
    );
  }

  // Get products from the API
  getProducts(): void {
    this.productService.getProducts().subscribe(
      (data: any) => {
        this.products = data;
      },
      (error: any) => {
        console.error('Error fetching products:', error);
      }
    );
  }

  getOrders(): void {
    this.orderService.getOrders().subscribe(
      (data: any) => {
        if (Array.isArray(data)) {
          this.orders = data;
        } else {
          console.error('Expected an array but got:', data);
        }
      },
      (error: any) => {
        console.error('Error fetching orders:', error);
      }
    );
  }

  // Get orderdetails from the API
  getOrderDetails(): void {
    this.orderdetailService.getOrderDetails().subscribe(
      (data: any) => {
        this.orderdetails = data;
      },
      (error: any) => {
        console.error('Error fetching order details:', error);
      }
    );
  }

  // Delete a customer
  deleteCustomer(id: number): void {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.deleteCustomer(id).subscribe(() => {
        this.getCustomers();  // Refresh the customer list
      });
    }
  }

  // Delete a product
  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.getProducts();  // Refresh the product list
      });
    }
  }

  // Delete an order
  deleteOrder(id: number): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.deleteOrder(id).subscribe(() => {
        this.getOrders();  // Refresh the orders list
      });
    }
  }

  // Delete an order detail
  deleteOrderDetail(id: number): void {
    if (confirm('Are you sure you want to delete this order detail entry?')) {
      this.orderdetailService.deleteOrderDetail(id).subscribe(() => {
        this.getOrderDetails();  // Refresh the order detail list
      });
    }
  }
}
