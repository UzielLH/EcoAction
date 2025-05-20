import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styles: ``
})
export class LoginComponent {
  private fb=inject(FormBuilder);
  loginForm!: FormGroup;
  private authService = inject(AuthService); // Inyectar el servicio
  private router = inject(Router);
  constructor() {
    this.loginForm=this.fb.group({
      username: ['',[Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }


  async register() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    try {
      const { username, password } = this.loginForm.value;
      const response: any = await firstValueFrom(
        this.authService.login({ username, password })
      );
      console.log('Response:', response);
      
      if (response.access_token) {
        console.log('Login exitoso:', response);
        localStorage.setItem('access_token', response.access_token); // Guardar el token en localStorage
        localStorage.setItem('refresh_token', response.refresh_token); // Guardar el refresh token en localStorage
        localStorage.setItem('rol', response.roles[0]); // Guardar el rol en localStorage
        localStorage.setItem('username', username); // Guardar el nombre de usuario en localStorage
        localStorage.setItem('userUuid', response.uuid); // Guardar el userId en localStorage

        Swal.fire({
          icon: 'success',
          title: '¡Login exitoso!',
          text: 'Bienvenido, ' + username,
          timer: 2000,
          showConfirmButton: false
        });

        this.router.navigate(['/home']); // Redirigir al dashboard o página principal
      } else {
        console.error('Error en el login:', response.message);
        // SweetAlert para credenciales incorrectas
          Swal.fire({
          icon: 'error',
          title: 'Error en el login',
          text: 'Credenciales incorrectas. Inténtalo de nuevo.',
          confirmButtonText: 'Aceptar'
        });      }
    } catch (error) {
      console.error('Error en el login:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error en el servidor',
        text: 'Ocurrió un error al iniciar sesión. Inténtalo más tarde.',
        confirmButtonText: 'Aceptar'
      });
    }
}
  // async register() {
  //   if (this.loginForm.invalid) {
  //     this.loginForm.markAllAsTouched();
  //     return;
  //   }

  //   try {
  //     const { username, password } = this.loginForm.value;
  //     const response:any = await this.authService.login(username, password);

  //     if (response.success) {
  //       console.log('Login exitoso:', response);
  //       this.router.navigate(['/home']); // Redirigir al dashboard o página principal
  //     } else {
  //       console.error('Error en el login:', response.message);
  //       alert('Credenciales incorrectas. Inténtalo de nuevo.');
  //     }
  //   } catch (error) {
  //     console.error('Error en el login:', error);
  //     alert('Ocurrió un error al iniciar sesión. Inténtalo más tarde.');
  //   }
  // }

  obtenerMensajesError(controlName: string) {
    const control = this.loginForm.get(controlName);
    const mensajes: any[] = [];
    if (control?.errors && control?.touched) {
      Object.keys(control.errors).forEach(keyError => {
        switch (keyError) {
          case 'required':
            mensajes.push('Este campo es requerido');
            break;
          case 'minlength':
            mensajes.push('El campo necesita el mínimo de caracteres');
            break;
          case 'pattern':
            mensajes.push('El formato no es correcto');
            break;          
        }
      });
    }
    return mensajes;
  }

}

