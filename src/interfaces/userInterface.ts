interface RegisterUserBody {
  firstName: string
  lastName: string
  email: string
  username: string
  phoneNumber: string
  password: string
  token: string
  refreshToken: string
}

interface ValidateUsernameAndEmailBody {
  email: string
  password: string
  username: string
}

interface ValidatePhoneNumber {
  phoneNumber: string
}

interface LoginUserBody {
  email: string
  password: string
}

interface UpdateUserRoleBody {
  id: string
  isEnrolled: boolean
}

export {
  ValidateUsernameAndEmailBody,
  ValidatePhoneNumber,
  RegisterUserBody,
  LoginUserBody,
  UpdateUserRoleBody,
}
