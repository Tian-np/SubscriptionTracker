export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  expirationTime: number | null;
}

export interface RegisterPushDto {
  subscription: PushSubscriptionPayload;
  deviceInfo?: {
    platform: string;
    userAgent: string;
    isStandalone: boolean;
  };
}
