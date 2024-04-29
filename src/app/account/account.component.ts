import { Component, Input, OnInit } from '@angular/core'
import { FormBuilder } from '@angular/forms'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthSession } from '@supabase/supabase-js'

import { Profile } from '../auth.service';
import { SharedService } from '../shared-service.service';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-account',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
})
export class AccountComponent implements OnInit {
  loading = false
  profile!: Profile

  email: string = '';
  username: string = '';
  website: string = '';
  avatar_url: string = '';
  color_picker: string = '';

  @Input()
  session!: AuthSession | any;

  updateProfileForm = this.formBuilder.group({
    username: '',
    full_name: '',
    website: '',
    avatar_url: '',
    color_picker: '',
  })

  constructor(
    private readonly authService: AuthService,

    private formBuilder: FormBuilder,
    private router: Router,
    private sharedService: SharedService,
  ) {}

  async ngOnInit() {

    await this.authService.authChanges((_, session) => (this.session = session))

    const { data: { user } } = await this.authService.user()


    await this.getProfile()

    const { username, full_name, website, avatar_url, color_picker } = this.profile 
    this.updateProfileForm.patchValue({
      username,
      full_name,
      website,
      avatar_url,
      color_picker
    })
  }

  async getProfile() {
    try {
      this.loading = true
      const { user } = this.session
      const { data: profile, error, status } = await this.authService.profile(user)

      if (error && status !== 406) {
        throw error
      }

      if (profile) {
        this.profile = {
          ...profile,
        };
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      this.loading = false
    }
  }

  async updateProfile(): Promise<void> {
    try {
      this.loading = true
      const { user } = this.session

      const username = this.updateProfileForm.value.username as string
      const full_name = this.updateProfileForm.value.full_name as string
      const website = this.updateProfileForm.value.website as string
      const avatar_url = this.updateProfileForm.value.avatar_url as string
      const color_picker = this.updateProfileForm.value.color_picker as string

      const { error } = await this.authService.updateProfile({
        id: user.id,
        username,
        full_name,
        website,
        avatar_url,
        color_picker
      })
      if (error) throw error
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      this.loading = false
    }
  }

  async signOut() {
    await this.authService.signOut()
    this.router.navigate(['/auth']);
  }

  onLinkClick() {
    this.sharedService.changeSession(this.session);
    this.updateProfile();
  }
}