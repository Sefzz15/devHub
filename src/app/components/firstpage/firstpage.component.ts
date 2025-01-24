  import { Component, OnInit } from '@angular/core';
  import { UserService } from '../../../services/user.service';
  import { CustomerService } from '../../../services/customer.service';
  import { ProductService } from '../../../services/product.service';
  import { OrderService } from '../../../services/order.service';

  @Component({
    standalone: false,
    selector: 'app-firstpage',
    templateUrl: './firstpage.component.html',
    styleUrl: './firstpage.component.css'
  })

  export class FirstpageComponent implements OnInit {
    users: any[] = [];
    customers: any[] = [];
    products: any[] = [];
    orders: any[] = [];
    datas: any[] = [];


    constructor(
      private userService: UserService,
      private customerService: CustomerService,
      private productService: ProductService,
      private orderService: OrderService) { }

    ngOnInit(): void {
    }

    getUsers(): void {
      this.userService.getUsers().subscribe(
        (data: any) => {
          console.log('Fetched users:', data.$values);
          this.users = data.$values; // Ensure this updates the array
        },
        (error: any) => {
          console.error('Error fetching users:', error);
        }
      );
    }

    // Delete a user
    deleteUser(id: number): void {
      if (confirm('Are you sure you want to delete this user?')) {
        this.userService.deleteUser(id).subscribe(() => {
          this.getUsers();  // Refresh the user list
        });
      }
    }

    // Get customers from the API
    getCustomers(): void {
      this.customerService.getCustomers().subscribe(
        (data: any) => {
          this.customers = data.$values;
        },
        (error: any) => {
          console.error('Error fetching customers:', error);
        }
      );
    }

    // Delete a customer
    deleteCustomer(id: number): void {
      if (confirm('Are you sure you want to delete this customer?')) {
        this.customerService.deleteCustomer(id).subscribe(() => {
          this.getCustomers();
        });
      }
    }

    // Utility function to get customer name by ID
    getCustomerName(cid: number): string {
      const customer = this.customers.find(c => c.cid === cid);
      return customer ? customer.firstname : 'Unknown';
    }

    // Utility function to get product by ID
    getProductById(pid: number): any {
      return this.products.find(product => product.pid === pid) || null;
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

  
    // Fetch products after deletion
    getProducts(): void {
      this.productService.getProducts().subscribe(
        (data: any) => {
          this.products = data.$values;
        },
        (error: any) => {
          console.error('Error fetching products:', error);
        }
      );
    }

    // Fetch orders after deletion
    getOrders(): void {
      this.orderService.getOrders().subscribe(
        (data: any) => {
          this.orders = data.$values;
        },
        (error: any) => {
          console.error('Error fetching orders:', error);
        }
      );
    }


  }
