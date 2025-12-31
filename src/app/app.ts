import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonicModule, RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('my-budget');
}
