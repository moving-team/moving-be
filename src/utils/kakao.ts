import { KAKAO_REST_API_KEY, KAKAO_REDIRECT_URI } from '../config/env';
import axios from 'axios';

class KaKao {
  constructor(
    private readonly redirectUri: string,
    private readonly key: string
  ) {
    this.key = KAKAO_REST_API_KEY;
    this.redirectUri = KAKAO_REDIRECT_URI;
  }

  getKakaoLoginUrl(userType: string, options?: { state: string }) {
    const state = options?.state || userType;
    const config = {
      client_id: this.key,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      userType,
      state,
    };
    return `https://kauth.kakao.com/oauth/authorize?${new URLSearchParams(
      config
    ).toString()}`;
  }
  async getToken(code: string) {
    const params = {
      client_id: this.key,
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri,
    };

    const { data } = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      }
    );

    const tokenData = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };

    return tokenData;
  }

  async getUserInfo(accessToken: string) {
    const { data } = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userdata = {
      nickname: data.kakao_account.profile.nickname,
      providerId: data.id,
    };

    return userdata;
  }
}

export const kakao = new KaKao(
  'http://localhost:3001/user/callback/kakao',
  KAKAO_REST_API_KEY
);
