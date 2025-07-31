import { Component, OnInit } from '@angular/core';
import { IUserValuesResponse } from '../../../interfaces/IUser';
import { SessionService } from '../../../services/session.service';
import { UserService } from '../../../services/user.service';
import { IUserResponse } from '../../../interfaces/IUser';
import { OrderDetailService } from '../../../services/orderDetail.service';
import { IinternalOrderView, IOrderDetails, IOrderDetailsValues, IUser } from '../../Models/IOrderDetails';

@Component({
  standalone: false,
  selector: 'app-order-history',
  templateUrl: './order-history.html',
  styleUrls: ['../admin/admin.component.css'],
})
export class OrderHistoryComponent implements OnInit {
  userID?: number;
  users: IUserResponse[] = [];
  clientNames: string[] = [];
  orderDetails?: IinternalOrderView[];


  constructor(
    private _sessionService: SessionService,
    private _userService: UserService,
    private _orderDetailService: OrderDetailService
  ) { }

  ngOnInit(): void {
    this.userID = this._sessionService.userID;
    this.getUsers();

    // this._orderDetailService.getOrderDetails().subscribe(
    //   (data) => {
    //     console.log('Order details fetched:', data);
    //     this.orderDetails = data.map((item: any) => ({
    //       orderId: item.oid,
    //       product: item.product.pname,
    //       quantity: item.quantity,
    //       price: item.product.price,
    //       totalPrice: item.quantity * item.product.price
    //     }));
    //   },
    //   (error) => {
    //     console.error('Error fetching order details:', error);
    //   }
    // );
  }

  getUsers(): void {
    this._userService.getUsers().subscribe(
      (data: IUserValuesResponse[]) => {
        this.clientNames = data.map(i => i.uname);
        console.log('Fetched users:', this.clientNames);
      },
      (error: any) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  selectClient(event: Event): void {
    const selectedClientName = (event.target as HTMLSelectElement).value;
    console.log('Client selected:', selectedClientName);

    this._orderDetailService.getOrderDetails().subscribe(
      (data: IOrderDetailsValues[]) => {
        console.log('All order details fetched:', data);

        const filteredOrders = data
          .filter(item => item.order?.user?.uname === selectedClientName)
          .map(item => ({
            orderId: item.oid,
            product: item.product.pname,
            quantity: item.quantity,
            price: item.product.price,
            totalPrice: item.quantity * item.product.price
          }));

        this.orderDetails = filteredOrders;

        console.log(`Order details for ${selectedClientName}:`, this.orderDetails);
      },
      (error) => {
        console.error('Error fetching order details:', error);
      }
    );
  }
}

