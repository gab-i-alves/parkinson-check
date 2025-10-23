export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ForgotPasswordRequest {
  email: string
}
