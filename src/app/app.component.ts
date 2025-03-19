import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { DolarService } from './services/dolar.service';
import { HomeComponent } from "./components/home/home.component";
import { HeaderComponent } from "./layout/header/header.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HomeComponent, HeaderComponent], 
  providers: [DolarService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent { 
  title = 'Dólar Hub'; 
}