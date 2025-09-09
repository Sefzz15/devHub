import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { SessionService } from '../../../services/session.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

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
  inactivityTimeout: any = null;
  currentGroup: string = '';

  constructor(
    private _sessionService: SessionService,
    private _authService: AuthService,
    private _router: Router
  ) { }

  ngOnInit() {
    this.username = this._sessionService.username;
    document.addEventListener('mousemove', this.resetInactivityTimer);
    document.addEventListener('keydown', this.resetInactivityTimer);
    this.startInactivityTimer();

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

    this._connection.on('UserJoinedGroup', (user: string, group: string) => {
      this.messages.push({ text: `${user} joined ${group}`, isSender: false });
      this.scrollToBottom();
    });

    this._connection.on('UserLeftGroup', (user: string, group: string) => {
      this.messages.push({ text: `${user} left ${group}`, isSender: false });
      this.scrollToBottom();
    });

  }

  sendMessage() {
    const text = this.messageInput?.trim();
    if (!text) return;

    const user = this.username;
    const group = this.currentGroup?.trim();

    const invoke = group
      ? this._connection.invoke('SendMessageToGroup', user, text, group)
      : this._connection.invoke('SendMessage', user, text);

    invoke.then(() => {
      this.messages.push({ text: `${user}: ${text}`, isSender: true });
      this.messageInput = '';
      this.unreadCount = 0;
      this.scrollToBottom();
    })
      .catch(err => console.error('Error while sending message: ', err));
  }


  joinGroup(groupName: string) {
    const groupNameTrimmed = groupName?.trim();
    if (!groupNameTrimmed) return;

    this._connection.invoke('JoinGroup', this.username, groupNameTrimmed)
      .then(() => { this.currentGroup = groupNameTrimmed; })
      .catch(err => console.error('Error joining group: ', err));
  }

  leaveGroup(groupName: string) {
    const groupNameTrimmed = groupName?.trim();
    if (!groupNameTrimmed) return;

    this._connection.invoke('LeaveGroup', this.username, groupNameTrimmed)
      .then(() => {
        if (this.currentGroup === groupNameTrimmed) this.currentGroup = '';
      })
      .catch(err => console.error('Error leaving group: ', err));
  }


  startInactivityTimer() {
    this.inactivityTimeout = setTimeout(() => {
      alert('You have been logged out due to inactivity.');
      this._authService.logout();
      this._router.navigate(['/']);
    }, 5 * 60 * 1000); // 5 minutes
  }

  resetInactivityTimer = () => {
    clearTimeout(this.inactivityTimeout);
    this.startInactivityTimer();
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
