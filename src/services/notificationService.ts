import notificationRepository from '../repositories/notificationRepository';
import { Notification } from '../types/serviceType';


export const findUnreadNotifications = async (userId: number) => {
  return await notificationRepository.findManyData({
    where: {
      userId,
      isRead: false, // 읽지 않은 알림만 조회
    },
    orderBy: { createdAt: 'desc' }, // 최신 순 정렬
  });
};


export const updateNotificationsRead = async (userId: number, notificationId: number) => {
  const notification = await notificationRepository.updateData({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      isRead: true,
    },
  });

  if (!notification) {
    throw new Error('Notification not found');
  }
};