import { Component, OnInit, OnDestroy } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { SessionService } from '../../../services/session.service';

@Component({
  standalone: false,
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {

  messages: { text: string; isSender: boolean }[] = [];
  messageInput: string = '';
  private connection!: signalR.HubConnection;
  username: string = '';

  constructor(private _sessionService: SessionService) { }

  ngOnInit() {
    this.username = this._sessionService.username;

    // Load saved messages if any (using sessionStorage instead of localStorage)
    const savedMessages = sessionStorage.getItem('messages');
    if (savedMessages) {
      this.messages = JSON.parse(savedMessages);
    }

    // Initialize SignalR connection
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:5000/chatHub')
      .withAutomaticReconnect()
      .build();

    // Start the connection
    this.connection.start()
      .then(() => {
        console.log('SignalR Connected.');
      })
      .catch((err) => console.error('SignalR Connection Error: ', err));

    // Listen for incoming messages
    this.connection.on('ReceiveMessage', (user: string, message: string) => {
      if (user !== this.username) {
        this.messages.push({ text: `${user}: ${message}`, isSender: false });
      }
    });
  }

  sendMessage() {
    if (this.messageInput.trim()) {
      const user = this.username;

      // Send message to the backend
      this.connection.invoke('SendMessage', user, this.messageInput)
        .then(() => {
          this.messages.push({ text: `${user}: ${this.messageInput}`, isSender: true });
          this.messageInput = '';
        })
        .catch((err) => console.error('Error while sending message: ', err));
    }
  }

  ngOnDestroy() {
    // Save messages before destruction (using sessionStorage)
    sessionStorage.setItem('messages', JSON.stringify(this.messages));

    if (this.connection) {
      this.connection.stop().catch((err) => console.error('Error while stopping connection: ', err));
    }
  }
}
