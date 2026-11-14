export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ChangePasswordResponse {
  message: string;
  data?: unknown;
}

export interface ProfilePictureResponse {
  message: string;
  data?: {
    data: {
      profile_picture: string;
    };
  };
}

