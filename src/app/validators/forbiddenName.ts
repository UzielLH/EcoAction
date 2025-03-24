import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function forbiddenName(): ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null => {
        if(!control.value){
            return null;
        }
        const forbiddenName='admin';
        if(control.value.toLowerCase()===forbiddenName.toLowerCase()){
            return {
                forbiden: {
                    value: control.value
                }
        }
        }
        return null;
    }
}