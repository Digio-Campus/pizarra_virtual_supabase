import { Routes } from '@angular/router';
import { AccountComponent } from './account/account.component';
import { CanvasComponent } from './canvas/canvas.component';

export const routes: Routes = [
    {
        path: '',
        component: AccountComponent,
        title: 'Canvas',
    },
    {
        path: 'canvas',
        component: CanvasComponent,
        title: 'Canvas',
    },
];
