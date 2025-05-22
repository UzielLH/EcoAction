import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router= inject(Router);
  const isLogged=localStorage.getItem('access_token');
  if(isLogged){
    return true;
  }else{
    router.navigateByUrl('/home');
    return false;
  }
};
