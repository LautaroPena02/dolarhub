import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  faGithub = faGithub;
  faLinkedin = faLinkedin;

  githubUrl = 'https://github.com/lautaropena02';
  linkedinUrl = 'https://linkedin.com/in/lautaropena02';
}
