import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { SessionService } from '../../../services/session.service';

@Component({
  standalone: false,
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('chatWindow') private chatWindowRef!: ElementRef;

  private _connection!: signalR.HubConnection;

  messages: { text: string; isSender: boolean }[] = [];
  messageInput: string = '';
  username: string = '';
  connectedUsers: string[] = []; // List of connected users
  unreadCount: number = 0;


  constructor(
    private _sessionService: SessionService
  ) { }

  ngOnInit() {
    this.username = this._sessionService.username;

    const savedUnreadCount = sessionStorage.getItem('unreadCount');
    if (savedUnreadCount) {
      this.unreadCount = JSON.parse(savedUnreadCount);
    }

    // Retrieve messages and connected users from sessionStorage
    const savedMessages = sessionStorage.getItem('messages');
    const savedUsers = sessionStorage.getItem('connectedUsers');
    if (savedMessages) {
      this.messages = JSON.parse(savedMessages);
    }
    if (savedUsers) {
      this.connectedUsers = JSON.parse(savedUsers);
    }

    // Create SignalR connection
    this._connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5001/chathub')
      .withAutomaticReconnect()
      .build();

    // Start the connection
    this._connection
      .start()
      .then(() => {
        console.log('SignalR Connected.');
        this._connection.invoke('UserConnected', this.username); // Register the user on the server
      })
      .catch((err) => console.error('SignalR Connection Error: ', err));

    // Receive messages and update the list of connected users
    this._connection.on('ReceiveMessage', (user: string, message: string) => {
      if (user !== this.username) {
        this.messages.push({ text: `${user}: ${message}`, isSender: false });
        this.unreadCount++;
        this.scrollToBottom();
      }
    });

    // Add a user to the list of connected users
    this._connection.on('UserConnected', (user: string) => {
      if (!this.connectedUsers.includes(user)) {
        this.connectedUsers.push(user);
      }
      this.messages.push({ text: `A wild ${user} appeared!`, isSender: false });
      this.scrollToBottom();
    });

    // Remove a user from the list of connected users
    this._connection.on('UserDisconnected', (user: string) => {
      this.connectedUsers = this.connectedUsers.filter((u) => u !== user);
      this.messages.push({ text: `A wild ${user} disappeared!`, isSender: false });
      this.scrollToBottom();
    });

    // Save the list of connected users to sessionStorage
    this._connection.on('ReceiveConnectedUsers', (users: string[]) => {
      this.connectedUsers = users;
    });
  }

  sendMessage() {
    if (this.messageInput.trim()) {
      const user = this.username;
      this._connection
        .invoke('SendMessage', user, this.messageInput)
        .then(() => {
          this.messages.push({ text: `${user}: ${this.messageInput}`, isSender: true });
          this.messageInput = '';
          this.unreadCount = 0;
          this.scrollToBottom();
        })
        .catch((err) => console.error('Error while sending message: ', err));
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const chatWindow = this.chatWindowRef.nativeElement;
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }, 100); // Slight delay to ensure the DOM updates before scrolling
  }

  markAsRead() {
    this.unreadCount = 0;
  }

  onInputFocus() {
    this.unreadCount = 0;
  }

  ngOnDestroy() {
    // Save the data before disconnecting
    sessionStorage.setItem('unreadCount', JSON.stringify(this.unreadCount));
    sessionStorage.setItem('messages', JSON.stringify(this.messages));
    sessionStorage.setItem('connectedUsers', JSON.stringify(this.connectedUsers));

    if (this._connection) {
      this._connection.invoke('UserDisconnected', this.username); // Notify the server about the disconnection
      this._connection.stop().catch((err) => console.error('Error while stopping connection: ', err));
    }
  }
}
