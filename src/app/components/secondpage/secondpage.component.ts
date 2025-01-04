import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../../services/customer.service';

@Component({
  standalone: false,
  selector: 'app-secondpage',
  templateUrl: './secondpage.component.html',
  styleUrls: ['../firstpage/firstpage.component.css'],
})
export class SecondpageComponent implements OnInit {
  customers: any[] = [];

  constructor(private customerService: CustomerService) { }

  ngOnInit(): void {
    this.getCustomers();
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

  // Delete a customers
  deleteCustomer(id: number): void {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.deleteCustomer(id).subscribe(() => {
        this.getCustomers();  // Refresh the customer list
      });
    }
  }
}
