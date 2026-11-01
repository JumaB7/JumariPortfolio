import { Injectable } from '@angular/core';
import { Validators, type ValidatorFn } from '@angular/forms';
import { CONTACT_LIMITS } from '../constants/contact.constants';

@Injectable({ providedIn: 'root' })
export class ValidationService {
  readonly contactLimits = CONTACT_LIMITS;

  contactNameValidators(): ValidatorFn[] {
    return [Validators.required, Validators.maxLength(CONTACT_LIMITS.nameMax)];
  }

  contactEmailValidators(): ValidatorFn[] {
    return [
      Validators.required,
      Validators.email,
      Validators.maxLength(CONTACT_LIMITS.emailMax),
    ];
  }

  contactMessageValidators(): ValidatorFn[] {
    return [
      Validators.required,
      Validators.minLength(CONTACT_LIMITS.messageMin),
      Validators.maxLength(CONTACT_LIMITS.messageMax),
    ];
  }
}
