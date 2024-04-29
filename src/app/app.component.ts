import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { AccountComponent } from './account/account.component';
import { SharedService } from './shared-service.service';
import { AuthService } from './auth.service';
import { AuthSession } from '@supabase/supabase-js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, ReactiveFormsModule, AuthComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-user-management'

  session!: AuthSession | any;
  constructor(private sharedService: SharedService, private authService: AuthService, private router: Router) { }

  async ngOnInit() {

    await this.authService.authChanges((_, session) => (this.session = session))
    console.log("VALOR DE SESSION -------------------> ", this.session)
    // await this.sharedService.currentSession.subscribe((session: any) => this.session = session);

  }

  async signOut() {
    await this.authService.signOut()
    this.router.navigate(['/auth']);
  }

  onLinkClick() {
    this.sharedService.changeSession(this.session);
  }
}
