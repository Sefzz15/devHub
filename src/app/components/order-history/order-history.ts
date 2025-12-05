import { Component, OnInit } from '@angular/core';
import { IUserValuesResponse } from '../../../interfaces/IUser';
import { SessionService } from '../../../services/session.service';
import { UserService } from '../../../services/user.service';
import { OrderDetailService } from '../../../services/orderDetail.service';
import { IGroupedOrder, IOrderDetailsValuesFormatted } from '../../../interfaces/IOrderDetail';

@Component({
  standalone: false,
  selector: 'app-order-history',
  templateUrl: './order-history.html',
  styleUrls: ['../admin/admin.component.css', './order-history.css'],
})
export class OrderHistoryComponent implements OnInit {
  userID?: number;
  clientNames: string[] = [];
  groupedOrderDetails: IGroupedOrder[] = [];
  noOrders: boolean = false;


  constructor(
    private _sessionService: SessionService,
    private _userService: UserService,
    private _orderDetailService: OrderDetailService
  ) { }

  ngOnInit(): void {
    this.userID = this._sessionService.userID;
    this.getUsers();
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

    this._orderDetailService.GetAllOrderDetailsFormatted().subscribe(
      (data: IOrderDetailsValuesFormatted[]) => {

        const userOrders = data.filter(item => item.order?.user?.uname === selectedClientName);
        userOrders.sort((a, b) => b.oid - a.oid);

        if (userOrders.length === 0) {
          this.groupedOrderDetails = [];
          this.noOrders = true;
          return;
        }

        const orderMap = new Map<number, IGroupedOrder>();

        userOrders.forEach(item => {
          const orderId = item.oid;
          const date = item.date;
          const itemTotal = item.quantity * item.price;

          if (!orderMap.has(orderId)) {
            orderMap.set(orderId, {
              orderId,
              date,
              totalAmount: 0,
              items: []
            });
          }

          const orderGroup = orderMap.get(orderId)!;
          orderGroup.items.push({
            product: item.productName,
            quantity: item.quantity,
            price: item.price,
            totalPrice: itemTotal
          });

          orderGroup.totalAmount += itemTotal;
        });

        this.groupedOrderDetails = Array.from(orderMap.values());
        this.noOrders = false;
      }
    );
  }


}

