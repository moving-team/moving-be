import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} from '../config/env';
import axios from 'axios';

class Google {
  constructor(
    private readonly redirectUri: string,
    private readonly clientId: string,
    private readonly clientSecret: string
  ) {
    this.clientId = GOOGLE_CLIENT_ID;
    this.clientSecret = GOOGLE_CLIENT_SECRET;
    this.redirectUri = GOOGLE_REDIRECT_URI;
  }
  private generateRandomState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  getGoogleLoginUrl(userType: string) {
    const randomState = this.generateRandomState();
    const state = `${userType}_${randomState}`;
    const config = {
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      state,
    };

    return `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(
      config
    ).toString()}`;
  }

  async getToken(code: string) {
    const config = {
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      code,
    };

    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      config,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data;
  }

  async getUserInfo(accessToken: string) {
    const response = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  }
}

export const google = new Google(
  GOOGLE_REDIRECT_URI,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET
);
