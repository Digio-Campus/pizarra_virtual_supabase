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

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  private client: SupabaseClient;

  constructor() { 
    this.client = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  listenMousePosition() {
    const channel = this.client
    .channel('room_1')
    // .on('broadcast', { event: 'MOUSE_EVENT' }, payload => {
    //   console.log('Cursor position received!', payload)
    // })
    // .subscribe((status) => {
    //   if (status === 'SUBSCRIBED') {
    //     console.log("PRUEBA DESDE EL SUSCRIBE")
    //     channel.send({
    //       type: 'broadcast',
    //       event: 'MOUSE_EVENT',
    //       payload: { userId, x, y }
    //     })
    //   }
    // })

    return channel;
  }
}
