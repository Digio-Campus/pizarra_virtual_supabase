import { Component, ElementRef, ViewChild, AfterViewInit, Input, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthSession } from '@supabase/supabase-js'
import { SharedService } from '../shared-service.service';
import { AuthService } from '../auth.service';
import { Profile } from '../auth.service';
import { BoardService } from '../board.service';

export interface User {
  position_x: string;
  position_y: string;
  color: string;
}

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements AfterViewInit {
  @Input()
  session!: AuthSession;
  private context: CanvasRenderingContext2D | null = null;
  private isDrawing: boolean = false;
  private lastX: number = 0;
  private lastY: number = 0;
  private users: any = {};


  @ViewChild('paintCanvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private boardService: BoardService,
    private sharedService: SharedService,
    private authService:AuthService,
  ) { }

  async ngOnInit() { 
    await this.sharedService.currentSession.subscribe((session: any) => this.session = session);

  }

  async ngAfterViewInit() {
    const context = this.canvas.nativeElement.getContext('2d');
    if (context !== null) {
      this.context = context;
      this.setupCanvas();
    } 
    else {
      console.error('No se pudo obtener el contexto 2D del canvas');
    }

    await this.getProfile();

    // Escuchamos la posición de los cursores de los demás usuarios
    this.boardService.listenMousePosition().on('broadcast', { event: 'MOUSE_EVENT' }, payload => {


        //Enviamos la posicion del cursor y el estado actual al metodo drawUsersCursor
        this.drawUsersCursor(payload['payload'].currentX, payload['payload'].currentY, payload['payload'].drawing);


        // Comprobamos si hay session
        if (this.session && this.session.user) {

          // Comprobamos si el usuario que envia la posición no es el mismo que el de la sesión actual
          if (this.users[payload['payload'].userId] !== this.session.user.id) {
            this.users[payload['payload'].userId] = {
              username: payload['payload'].username,
              position_x: payload['payload'].currentX,
              position_y: payload['payload'].currentY,
              color: payload['payload'].color
            };
          }

        }


      //Convertimos el objeto en un array
      const usersArray = Object.entries(this.users);

      //Recorremos el array de usuarios y por cada usuario dibujamos su cursor
      usersArray.forEach(([userId, e]: [string, any]) => {

        // Solo dibujamos el cursor si el usuario no es el mismo que el de la sesión actual
        if (userId !== this.session.user.id) {
          this.drawCursor(e.username, e.position_x, e.position_y, e.color);
        }
      });

    });
  }

  ngOnDestroy() { 
    // this.supabaseService.listenMousePosition().unsubscribe();

  }


  private setupCanvas() {
    if (this.context) {
      this.context.lineCap = 'round';
      this.context.lineWidth = 5;
      this.context.strokeStyle = 'black';

      this.adjustCanvasSize(); // Ajustar el tamaño del canvas una vez al principio

      window.addEventListener('resize', () => this.adjustCanvasSize()); // Ajustar el tamaño del canvas en cada redimensionamiento de ventana

      this.canvas.nativeElement.addEventListener('mousemove', (event) => this.draw(event));
      // this.canvas.nativeElement.addEventListener('mouseleave', () => this.stopDrawing());
      this.canvas.nativeElement.addEventListener('mousedown', (event) => this.startDrawing(event));
      // this.canvas.nativeElement.addEventListener('mouseup', () => this.stopDrawing());
    }
  }


  
  private adjustCanvasSize() {
    const canvas = this.canvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  private cursorElement: SVGElement | null = null;

  //Metodo para dibujar el cursor de los demas usuarios
  private drawCursor(username: string, x: number, y: number, color: string) {

    if(this.context) {
      // Si el cursor aún no ha sido creado lo creamos.
      if (!this.cursorElement) {
        this.cursorElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.cursorElement.setAttribute('width', '200'); // Aumenta el tamaño del SVG.
        this.cursorElement.setAttribute('height', '100');
        this.cursorElement.style.position = 'absolute';
  
        // Creamos el elemento 'path'.
        let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M2.717 2.22918L15.9831 15.8743C16.5994 16.5083 16.1503 17.5714 15.2661 17.5714H9.35976C8.59988 17.5714 7.86831 17.8598 7.3128 18.3783L2.68232 22.7C2.0431 23.2966 1 22.8434 1 21.969V2.92626C1 2.02855 2.09122 1.58553 2.717 2.22918Z');
        path.setAttribute('fill', color);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '2');
  
        // Crea el elemento de texto SVG.
        let textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textElement.setAttribute('x', '20');
        textElement.setAttribute('y', '50');
        textElement.setAttribute('font-size', '10'); // Disminuye el tamaño del texto.
        textElement.textContent = username;
  
        // Agregamos el 'path' y el texto al SVG.
        this.cursorElement.appendChild(path);
        this.cursorElement.appendChild(textElement);
  
        // Agregamos el SVG al DOM.
        document.body.appendChild(this.cursorElement);
      }
  
      // Actualizamos la posición del cursor.
      if (this.cursorElement) {
        this.cursorElement.style.top = y + 'px';
        this.cursorElement.style.left = x + 'px';
      }
    }

  }

  private startDrawing(event: MouseEvent) {
    this.isDrawing = true;
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    this.lastX = event.clientX - rect.left;
    this.lastY = event.clientY - rect.top;
  }

  private draw(event: MouseEvent) {

    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;

    const eventType = event.type;

    const channel = this.boardService.listenMousePosition();

    channel.subscribe((status) => {


      if (event.buttons === 1) { // Verifica si se está haciendo clic (botón izquierdo del mouse)
        if (!this.isDrawing || !this.context) {
          this.startDrawing(event);
        } else {
          this.context.beginPath();
          this.context.moveTo(this.lastX, this.lastY);
          this.context.lineTo(currentX, currentY);
          this.context.stroke();

          this.lastX = currentX;
          this.lastY = currentY;
        }

        if (status === 'SUBSCRIBED') {

          channel.send({
            type: 'broadcast',
            event: 'MOUSE_EVENT',
            payload: { userId: this.session.user.id, currentX, currentY, drawing: true, event: eventType, color: this.profile.color_picker}
          })

          // console.log("ENVIANDO  ");

        }
      }
     
      if (status === 'SUBSCRIBED') {
        // this.supabaseService.sendMousePosition(this.session.user.id, currentX, currentY);

        if(this.session && this.session.user) {
          channel.send({
            type: 'broadcast',
            event: 'MOUSE_EVENT',
            payload: { userId: this.session.user.id, currentX, currentY, drawing: false, color: this.profile.color_picker, username: this.profile.username}
          })

        }
      }

    });

  }

  private isDrawing2: boolean = false;

  private StartDrawingOtherUsers(position_x:any, position_y:any) {
    this.isDrawing2 = true;
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    this.lastX = position_x - rect.left;
    this.lastY = position_y - rect.top;
  }


  private drawUsersCursor(position_x:any, position_y:any, drawing:boolean) {

    // const rect = this.canvas.nativeElement.getBoundingClientRect();
    const currentX = position_x;
    const currentY = position_y;

    const channel = this.boardService.listenMousePosition();

    if (drawing) { // Verifica si se está haciendo clic (botón izquierdo del mouse)
      if (!this.isDrawing2 || !this.context) {
        this.StartDrawingOtherUsers(currentX, currentY);

      } else {
        this.context.beginPath();
        this.context.moveTo(this.lastX, this.lastY);
        this.context.lineTo(currentX, currentY);
        this.context.stroke();

        this.lastX = currentX;
        this.lastY = currentY;
      }

      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'MOUSE_EVENT',
          payload: { userId: this.session.user.id, currentX: currentX, currentY: currentY, drawing: true, username: this.profile.username }
        })
      }
      
    }
    else {
      this.lastX = currentX;
      this.lastY = currentY;
    }
  }

  profile!: Profile;
  loading = false


  async getProfile() {

    if(this.session && this.session.user) {
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
      } 
      catch (error) {
        if (error instanceof Error) {
          alert(error.message)
        }
      } 
      finally {
        this.loading = false
      }
    }
  }
}
