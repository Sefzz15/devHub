import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection: HubConnection | undefined;
  public messages = new BehaviorSubject<any[]>([]); // For storing messages

  constructor() {
    this.startConnection();
    this.addReceiveMessageListener();
  }

  private startConnection() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:5000/chatHub', {
        withCredentials: true // Sends cookies/credentials
      })
      .build();

    this.hubConnection.start()
      .then(() => console.log('SignalR connection established'))
      .catch(err => console.log('Error while establishing connection: ' + err));
  }

  // Add a listener for receiving messages
  private addReceiveMessageListener() {
    if (this.hubConnection) {
      this.hubConnection.on('ReceiveMessage', (user: string, message: string) => {
        this.messages.next([...this.messages.value, { user, message }]);
      });
    }
  }

  // Method for sending messages
  public sendMessage(user: string, message: string) {
    if (this.hubConnection) {
      this.hubConnection.send('SendMessage', user, message)
        .catch(err => console.log('Error while sending message: ' + err));
    }
  }
}
