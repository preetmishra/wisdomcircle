import { HttpStatus } from "@nestjs/common";

export class GenericServerError extends Error {
  code: string;
  status: number;

  constructor(
    message = "Internal server error",
    code = "GENERIC",
    status = HttpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message);
    this.code = code;
    this.status = status;
  }

  getResponseBody() {
    return {
      message: this.message,
      code: this.code,
    };
  }

  getResponseStatus() {
    return this.status;
  }
}

export class EmailAlreadyExists extends GenericServerError {
  constructor() {
    super("Email already exists", "AUTH-REG-1", HttpStatus.CONFLICT);
  }
}

export class PhoneAlreadyExists extends GenericServerError {
  constructor() {
    super("Phone already exists", "AUTH-REG-2", HttpStatus.CONFLICT);
  }
}

export class EmailAndPhoneAlreadyExists extends GenericServerError {
  constructor() {
    super("Email and phone already exists", "AUTH-REG-3", HttpStatus.CONFLICT);
  }
}

export class EmailIsNotRegistered extends GenericServerError {
  constructor() {
    super("Email is not registered", "AUTH-LOGIN-1", HttpStatus.BAD_REQUEST);
  }
}

export class PhoneIsNotRegistered extends GenericServerError {
  constructor() {
    super("Phone is not registered", "AUTH-LOGIN-2", HttpStatus.BAD_REQUEST);
  }
}

export class PasswordIsIncorrect extends GenericServerError {
  constructor() {
    super("Password is incorrect", "AUTH-LOGIN-3", HttpStatus.BAD_REQUEST);
  }
}

export class InvalidRefreshToken extends GenericServerError {
  constructor() {
    super(
      "Refresh token is invalid",
      "AUTH-REF-TOKEN-1",
      HttpStatus.UNAUTHORIZED
    );
  }
}

export class InvalidEmailVerificationCode extends GenericServerError {
  constructor() {
    super(
      "Email verification code is either invalid or expired",
      "AUTH-VERIFY-1",
      HttpStatus.BAD_REQUEST
    );
  }
}

export class InvalidPhoneVerificationCode extends GenericServerError {
  constructor() {
    super(
      "Phone verification code is either invalid or expired",
      "AUTH-VERIFY-2",
      HttpStatus.BAD_REQUEST
    );
  }
}

export class UserIdDoesNotExist extends GenericServerError {
  constructor() {
    super(
      "Could not find any user for the given userId",
      "AUTH-VERIFY-NOTIFY-1",
      HttpStatus.BAD_REQUEST
    );
  }
}
