import { Response, Request } from 'express';
import { findUnreadNotifications, updateNotificationsRead } from '../services/notificationService';

type ClientMap = Map<string, Response>;

const clients: ClientMap = new Map();

// SSE 연결 엔드포인트
export const connectToNotifications = (req: Request, res: Response): void => {
  try {
    if (!req.user || typeof req.user === 'string') {
      throw new Error('로그인이 필요한 서비스입니다.');
    }
    const userId = req.user.id;

    // SSE 헤더 설정
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 클라이언트 연결 저장
    clients.set(userId, res);
    console.log(`User ${userId} connected to notifications`);

    // 연결 종료 처리
    req.on('close', () => {
      console.log(`User ${userId} disconnected`);
      clients.delete(userId);
    });
  } catch (error) {
    // 에러 처리: 인증되지 않은 사용자
    console.error(error);
    res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
  }
};

// 알림 보내기기
export const sendNotification = (
  userId: string,
  notification: {
    id: number;
    contents: string;
    createdAt: Date;
    estimateRequestId: number;
    estimateId: number | null;
    assignedEstimateRequestId: number | null;
    isRead: boolean;
  }
): void => {
  const client = clients.get(userId);
  if (client) {
    client.write(`data: ${JSON.stringify(notification)}\n\n`);
  }
};

// 누적 알림 조회
export const getUnreadNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || typeof req.user === 'string') {
      throw new Error('로그인이 필요한 서비스입니다.');
    }
    const userId = req.user.id;

    // 읽지 않은 알림 또는 조건에 맞는 알림 조회
    const notifications = await findUnreadNotifications(userId);

    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '읽지 않은 알림 조회 실패' });
  }
};

// 읽지 않은 알림 상태 변경경
export const postNotificationMarkRead = (req: Request, res: Response): void => {
  try {
    if (!req.user || typeof req.user === 'string') {
      throw new Error('로그인이 필요한 서비스입니다.');
    }
    const userId = req.user.id;
    const notificationId = parseInt(req.params.notificationId, 10);

    // 알림 상태 변경
    updateNotificationsRead(userId, notificationId);
    res.status(200).json({ message: 'read 상태 업데이트 완료' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'read 상태 업데이트 실패' });
  }
};