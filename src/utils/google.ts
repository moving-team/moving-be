import e from 'express';
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
    // 로깅
    // console.log('[Google Login] Generating Google Login URL');

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
    // 로깅
    // console.log('[Google Login] Requesting access token');

    const config = {
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      code,
    };

    try {

      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        config,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );


      // 로깅
      // console.log('[Google Login] Access token received:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('[Google Login] Error fetching access token:', error.message);
      throw new Error('Failed to fetch access token');
    }
  }


  async getUserInfo(accessToken: string) {
    // 로깅 
    // console.log('[Google Login] Requesting user info');

    try {
      const response = await axios.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log('[Google Login] User info received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[Google Login] Error fetching user info:', error.message);
      throw new Error('Failed to fetch user info');
    }
  }
}

export const google = new Google(
  GOOGLE_REDIRECT_URI,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET
);
