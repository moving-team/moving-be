import {
  NAVER_CLIENT_ID,
  NAVER_CLIENT_SECRET,
  NAVER_REDIRECT_URI,
} from '../config/env';
import axios from 'axios';

class Naver {
  constructor(
    private readonly redirectUri: string,
    private readonly key: string,
    private readonly secret: string
  ) {
    this.key = NAVER_CLIENT_ID;
    this.secret = NAVER_CLIENT_SECRET;
    this.redirectUri = NAVER_REDIRECT_URI;
  }
  private generateRandomState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  getNaverLoginUrl(userType: string, options?: { state: string }) {
    const randomState = this.generateRandomState();
    const state = `${userType}_${randomState}`;
    const config = {
      response_type: 'code',
      client_id: this.key,
      redirect_uri: this.redirectUri,
      userType,
      state,
    };
    return `https://nid.naver.com/oauth2.0/authorize?${new URLSearchParams(
      config
    ).toString()}`;
  }

  async getToken(code: string) {
    const config = {
      grant_type: 'authorization_code',
      client_id: this.key,
      client_secret: this.secret,
      redirect_uri: this.redirectUri,
      code,
    };
    const response = await axios.get(
      `https://nid.naver.com/oauth2.0/token?${new URLSearchParams(
        config
      ).toString()}`
    );
    return response.data;
  }

  async getUserInfo(accessToken: string) {
    const response = await axios.get(`https://openapi.naver.com/v1/nid/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  }
}

export const naver = new Naver(
  'http://localhost:3001/user/callback/naver',
  NAVER_CLIENT_ID,
  NAVER_CLIENT_SECRET
);
