interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
  password: string;
  isServiceProvider: boolean;
  avatarUri?: string;
  token?: string;
  refreshToken?: string;
  fcmToken?: string;
  lastLogin: Date;
  deletedAt?: Date;
  isDisabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  userPreference: string[];
  schedule: Schedule[];
}


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
  User,
  ValidateUsernameAndEmailBody,
  ValidatePhoneNumber,
  RegisterUserBody,
  LoginUserBody,
  UpdateUserRoleBody,
}
