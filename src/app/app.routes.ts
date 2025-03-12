import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { InformacionComponent } from './pages/informacion/informacion.component';
import { MapaComponent } from './pages/mapa/mapa.component';
import { TipsComponent } from './pages/tips/tips.component';

export const routes: Routes = [
    {
        path:'home',
        component: HomeComponent
    },
    {
        path:'informacion',
        component: InformacionComponent
    },
    {
        path:'mapa',
        component: MapaComponent
    },
    {
        path:'tips',
        component: TipsComponent
    },
    {
        path:'**',
        redirectTo: 'home',
        pathMatch: 'full'
    }
];
