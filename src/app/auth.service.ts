import { Injectable } from '@angular/core';
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js'
import { environment } from '../environments/environment'
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router'

export interface Profile {
  id?: string
  username?: string
  full_name: string
  website: string
  avatar_url: string
  color_picker: string
}



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private client: SupabaseClient;
  private _session: AuthSession | null = null;
  private _currentUser: BehaviorSubject<boolean | User | any> = new BehaviorSubject(null)

  constructor(private router: Router) { 
    this.client = createClient(environment.supabaseUrl, environment.supabaseKey);

    // console.log("TEST SESION ---------> ", this.client.auth.getUser());

    const user = this.client.auth.getUser()
    if (user) {
      this._currentUser.next(user)
    } else {
      this._currentUser.next(false)
    }

    this.client.auth.onAuthStateChange((event, session) => {
      if (event == 'SIGNED_IN') {
        this._currentUser.next(session!.user)
      } else {
        this._currentUser.next(false)
        this.router.navigateByUrl('/', { replaceUrl: true })
      }
    })

  }

  get session() {
    this.client.auth.getSession().then(({ data }) => {
      this._session = data.session
    })
    return this._session
  }

  public profile(user: User) {
    return this.client
      .from('profiles')
      .select(`username, full_name, website, avatar_url, color_picker`)
      .eq('id', user.id)
      .single()
  }

  public updateProfile(profile: Profile) {
    const update = {
      ...profile,
      updated_at: new Date(),
    }

    return this.client.from('profiles').upsert(update)
  }

  async getUser() {
    try {
      const { data: user, error } = await this.client.auth.getUser();
      if (error) {
        throw error;
      }
      return user;
    } catch (error:any) {
      console.error('Error al obtener el usuario:', error.message);
      return null;
    }
  }

  get currentUser() {
    return this._currentUser.asObservable()
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.client.auth.onAuthStateChange(callback)
  }

  async signInWithGithub() {
    await this.client.auth.signInWithOAuth({
      provider: 'github',
    });
  }

  //Magic link sign in
  async signIn(email: string) {
    return this.client.auth.signInWithOtp({ email })
  }

  signOut() {
    return this.client.auth.signOut()
  }

  user() {
    return this.client.auth.getUser();
  }
}
