import { Component } from '@angular/core';
import { Router,  RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports:[RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'BBC_Ops';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    window.addEventListener('storage', (event) => {
      if (event.key === 'jwtToken' && event.newValue === null) {
        this.authService.logout(); 
        this.router.navigate(['/login']);
      }
    });
  }
}
