export class EmailAlreadyExists extends Error {}
export class PhoneAlreadyExists extends Error {}
export class EmailAndPhoneAlreadyExists extends Error {}

export class EmailIsNotRegistered extends Error {}
export class PhoneIsNotRegistered extends Error {}
export class PasswordIsIncorrect extends Error {}

export class InvalidRefreshToken extends Error {}

export class InvalidEmailVerificationCode extends Error {}
export class InvalidPhoneVerificationCode extends Error {}
