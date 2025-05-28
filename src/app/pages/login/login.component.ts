import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { PasswordEmpService } from '../../services/PasswordEmp.service';
import { NotificacionService } from '../../services/notificacion.service';

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
  private notificacionServive = inject(NotificacionService); // Inyectar el servicio de notificaciones
  private passwordService = inject(PasswordEmpService); // inyecta el servicio

  private router = inject(Router);
  constructor() {
    this.loginForm=this.fb.group({
      username: ['',[Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }


//   async register() {
//     if (this.loginForm.invalid) {
//       this.loginForm.markAllAsTouched();
//       return;
//     }

//     try {
//       const { username, password } = this.loginForm.value;
//       const response: any = await firstValueFrom(
//         this.authService.login({ username, password })
//       );
//       console.log('Response:', response);
      
//       if (response.access_token) {
//         console.log('Login exitoso:', response);
//         localStorage.setItem('access_token', response.access_token); // Guardar el token en localStorage
//         localStorage.setItem('refresh_token', response.refresh_token); // Guardar el refresh token en localStorage
//         localStorage.setItem('rol', response.roles[0]); // Guardar el rol en localStorage
//         localStorage.setItem('username', username); // Guardar el nombre de usuario en localStorage
//         localStorage.setItem('userUuid', response.uuid); // Guardar el userId en localStorage

//         Swal.fire({
//           icon: 'success',
//           title: '¡Login exitoso!',
//           text: 'Bienvenido, ' + username,
//           timer: 2000,
//           showConfirmButton: false
//         });

//         this.router.navigate(['/home']); // Redirigir al dashboard o página principal
//       } else {
//         console.error('Error en el login:', response.message);
//         // SweetAlert para credenciales incorrectas
//           Swal.fire({
//           icon: 'error',
//           title: 'Error en el login',
//           text: 'Credenciales incorrectas. Inténtalo de nuevo.',
//           confirmButtonText: 'Aceptar'
//         });      }
//     } catch (error) {
//       console.error('Error en el login:', error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Error en el servidor',
//         text: 'Ocurrió un error al iniciar sesión. Inténtalo más tarde.',
//         confirmButtonText: 'Aceptar'
//       });
//     }
// }

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
    
    if (response.access_token) {
      // Guardar datos en localStorage
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('rol', response.roles[0]);
      localStorage.setItem('username', username);
      localStorage.setItem('userUuid', response.uuid);

      // Verificar rol
      const rol = localStorage.getItem('rol');
      if (rol === 'empresa-realm-rol') {
        const datosEmpresa: any = await firstValueFrom(this.passwordService.DatosEmpresa(localStorage.getItem('userUuid') || ''));
        console.log('Datos de la empresa:', datosEmpresa);

        // Check if datosEmpresa is an array or a single object
        let usuarioActual;
        if (Array.isArray(datosEmpresa)) {
          usuarioActual = datosEmpresa.find((emp: any) => emp.username === username);
        } else {
          // If it's a single object, check if it matches the username
          // Use case-insensitive comparison for username
          usuarioActual = datosEmpresa.username?.toLowerCase() === username.toLowerCase() ? datosEmpresa : null;
        }

        // Debug output
        console.log('Usuario actual:', usuarioActual);
        console.log('Temporal password flag:', usuarioActual?.temporalPassword);

        // Ensure we check the property correctly
        if (usuarioActual && usuarioActual.temporalPassword === true) {
          const { value: contrasena } = await Swal.fire({
            title: 'Contraseña temporal detectada',
            input: 'password',
            inputLabel: 'Ingresa tu nueva contraseña',
            inputPlaceholder: 'Nueva contraseña',
            inputAttributes: {
              minlength: '6',
              required: 'true'
            },
            confirmButtonText: 'Actualizar',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            preConfirm: (value) => {
              if (!value || value.length < 6) {
                Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres');
              }
              return value;
            }
          });

          if (contrasena) {
            console.log('Nueva contraseña:', contrasena);
            // Llamar a la API para cambiar la contraseña
            await firstValueFrom(this.passwordService.cambiarContraseña(response.uuid, contrasena));

            Swal.fire({
              icon: 'success',
              title: 'Contraseña actualizada',
              text: 'Tu contraseña ha sido actualizada correctamente.',
              timer: 2000,
              showConfirmButton: false
            });
          } else {
            // Si cancela, puedes redirigirlo fuera del sistema si lo deseas
            this.router.navigate(['/']);
            return;
          }
        }
      }

  if (rol === 'user-realm-rol') {
    const userUuid = localStorage.getItem('userUuid');
    if (userUuid) {
      this.notificacionServive.getNotificacionesByUserUuid(userUuid)
        .subscribe({
          next: (notificacion) => {
            console.log('Nueva notificación recibida:', notificacion);
            Swal.fire({
              toast: true,
              position: window.innerWidth < 768 ? 'center' : 'top-end',
              icon: 'info',
              title: notificacion.titulo,
              text: notificacion.mensaje,
              showConfirmButton: false,
              timer: 5000,
              width: window.innerWidth < 768 ? '90%' : 'auto',
              customClass: {
                container: 'notification-container',
                popup: 'bg-white bg-opacity-95 rounded-lg shadow-lg p-4 max-w-sm mt-20',
                title: 'text-lg font-semibold text-gray-800',
                htmlContainer: 'text-sm text-gray-600'
              },
              showClass: {
                popup: 'animate__animated animate__fadeIn'
              },
              hideClass: {
                popup: 'animate__animated animate__fadeOut'
              }
            });
          },
          error: (error) => {
            console.error('Error en la conexión SSE:', error);
            Swal.fire({
              toast: true,
              position: window.innerWidth < 768 ? 'center' : 'top-end',
              icon: 'error',
              title: 'Error de conexión',
              text: 'Se perdió la conexión con el servidor de notificaciones',
              showConfirmButton: false,
              timer: 3000,
              width: window.innerWidth < 768 ? '90%' : 'auto',
              customClass: {
                popup: 'bg-white bg-opacity-95 rounded-lg shadow-lg p-4 max-w-sm mt-20'
              }
            });
          }
        });
    }
  }

  // Mostrar mensaje de éxito y redirigir después de las notificaciones
  Swal.fire({
      icon: 'success',
      title: '¡Login exitoso!',
      text: 'Bienvenido, ' + username,
      timer: 2000,
      showConfirmButton: false,
      position: window.innerWidth < 768 ? 'center' : 'center',
      width: window.innerWidth < 768 ? '90%' : 'auto'
  });

this.router.navigate(['/home']);

      this.router.navigate(['/home']);

    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error en el login',
        text: 'Credenciales incorrectas. Inténtalo de nuevo.',
        confirmButtonText: 'Aceptar'
      });
    }

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

