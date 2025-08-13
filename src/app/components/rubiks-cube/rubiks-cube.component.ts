import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-rubiks-cube',
  standalone: false,

  templateUrl: './rubiks-cube.component.html',
  styleUrls: [
    '../admin/admin.component.css',
    './rubiks-cube.component.css'],
})
export class RubiksCubeComponent implements OnInit {

  ngOnInit(): void {

  }
  @ViewChild('cube') cube!: ElementRef;
  isDragging = false;
  lastMouseX = 0;
  lastMouseY = 0;
  rotationX = 0;
  rotationY = 0;
  nineArray = Array(9).fill(0);

  ngAfterViewInit(): void {
    this.cube.nativeElement.style.transform = `rotateX(${this.rotationX}deg) rotateY(${this.rotationY}deg)`;
  }

  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.lastMouseX;
    const deltaY = event.clientY - this.lastMouseY;

    this.rotationY += deltaX * 0.5;
    this.rotationX -= deltaY * 0.5;

    this.cube.nativeElement.style.transform = `rotateX(${this.rotationX}deg) rotateY(${this.rotationY}deg)`;

    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
  }

  onMouseUp(): void {
    this.isDragging = false;
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') this.rotationY -= 10;
    if (event.key === 'ArrowRight') this.rotationY += 10;
    if (event.key === 'ArrowUp') this.rotationX -= 10;
    if (event.key === 'ArrowDown') this.rotationX += 10;

    this.cube.nativeElement.style.transform = `rotateX(${this.rotationX}deg) rotateY(${this.rotationY}deg)`;
  }

}