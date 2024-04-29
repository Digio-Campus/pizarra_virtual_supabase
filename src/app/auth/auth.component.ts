import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  email: string = '';

  constructor(private readonly authService: AuthService) {}

  async signIn() {
    try {
      const { error } = await this.authService.signIn(this.email)
      if (error) throw error
      alert('Check your email for the login link!')
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      // this.signInForm.reset()
      // this.loading = false
    }
  }
  async signInWithGithub() {
    const response = await this.authService.signInWithGithub();

    console.log(response);
  }


}
