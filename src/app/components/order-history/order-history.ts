import { TranslatePipe } from '../../../pipes/translate.pipe';
import { Component, OnInit, signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { SessionService } from '../../../services/session.service';
import { UserService } from '../../../services/user.service';
import { OrderDetailService } from '../../../services/orderDetail.service';
import { IGroupedOrder, IOrderDetailsValuesFormatted } from '../../../interfaces/IOrderDetail';

@Component({
  standalone: true,
  imports: [TranslatePipe],
  selector: 'app-order-history',
  templateUrl: './order-history.html',
  styleUrls: ['../admin/admin.component.css', './order-history.css'],
})
export class OrderHistoryComponent implements OnInit {
  readonly userID = signal<number | undefined>(undefined);
  readonly groupedOrderDetails = signal<IGroupedOrder[]>([]);
  readonly noOrders = signal(false);


  private readonly _sessionService = inject(SessionService);
  private readonly _userService = inject(UserService);
  private readonly _orderDetailService = inject(OrderDetailService);

  readonly clientNames = toSignal(
    this._userService.getUsers().pipe(map(users => users.map(u => u.uname))),
    { initialValue: [] as string[] },
  );

  ngOnInit(): void {
    this.userID.set(this._sessionService.userID);
  }


  selectClient(event: Event): void {
    const selectedClientName = (event.target as HTMLSelectElement).value;
    console.log('Client selected:', selectedClientName);

    this._orderDetailService.GetAllOrderDetailsFormatted().subscribe(
      (data: IOrderDetailsValuesFormatted[]) => {

        const userOrders = data.filter(item => item.order?.user?.uname === selectedClientName);
        userOrders.sort((a, b) => b.oid - a.oid);

        if (userOrders.length === 0) {
          this.groupedOrderDetails.set([]);
          this.noOrders.set(true);
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

        this.groupedOrderDetails.set(Array.from(orderMap.values()));
        this.noOrders.set(false);
      }
    );
  }


}

