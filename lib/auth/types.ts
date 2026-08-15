export type SessionUser = {
  id: string
  email: string
  name: string | null
  image: string | null
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AuthError"
  }
}
