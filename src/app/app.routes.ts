import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { InformacionComponent } from './pages/informacion/informacion.component';
import { MapaComponent } from './pages/mapa/mapa.component';
import { TipsComponent } from './pages/tips/tips.component';
import { LoginComponent } from './pages/login/login.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { ColocacionPuntosComponent } from './pages/colocacion-puntos/colocacion-puntos.component';
import { CreacionMetasComponent } from './pages/creacion-metas/creacion-metas.component';
import { MetasCardComponent } from './components/metas-card/metas-card.component';
import { MetasComponent } from './pages/metas/metas.component';
import { AddFondosComponent } from './pages/add-fondos/add-fondos.component';
import { CrearEmpresaComponent } from './pages/crearEmpresa/crearEmpresa.component';
import { CrearAdminComponent } from './pages/crearAdmin/crearAdmin.component';
import { PerfilComponent } from './pages/perfil/perfil.component';

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
        path:'login',
        component: LoginComponent
    },
    {
        path:'signup',
        component: SignUpComponent
    },
    {
        path:'colocacionPuntos',
        component: ColocacionPuntosComponent
    },
    {
        path: 'creacionMetas',
        component: CreacionMetasComponent
    },{
        path:'metas',
        component: MetasComponent
    },
    {
        path:'addFondos',
        component: AddFondosComponent
    },
    {
        path:'crearEmpresa',
        component: CrearEmpresaComponent
    },
    {
        path:'crearAdmin',
        component: CrearAdminComponent
    },
    {
        path:'perfil',
        component: PerfilComponent
    },
    {
        path:'**',
        redirectTo: 'home',
        pathMatch: 'full'
    }
];
