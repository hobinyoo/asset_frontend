export interface LoginRequest {
  loginId: string
  password: string
}

export interface SignupRequest {
  loginId: string
  password: string
}

export interface UserResponse {
  id: number
  loginId: string
}
