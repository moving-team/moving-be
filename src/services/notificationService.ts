import notificationRepository from '../repositories/notificationRepository';

export const findUnreadNotifications = async (userId: number): Promise<{
  notReadCount: number;
  list: {
    id: number;
    contents: string;
    createdAt: Date;
    estimateRequestId: number;
    estimateId: number | null;
    assignedEstimateRequestId: number | null;
    isRead: boolean;
  }[];
}> => {
  // 읽지 않은 알림 조회
  const unreadNotifications = await notificationRepository.findManyData({
    where: {
      userId,
      isRead: false, // 읽지 않은 알림만
    },
    orderBy: { createdAt: 'desc' }, // 최신 순 정렬
  });

  // 읽지 않은 알림 총 갯수
  const notReadCount = unreadNotifications.length;

  // 알림 목록 가공
  const list = unreadNotifications.map((notif) => ({
    id: notif.id,
    contents: notif.contents,
    createdAt: notif.createdAt,
    estimateRequestId: notif.estimateRequestId,
    estimateId: notif.estimateId || null,
    assignedEstimateRequestId: notif.assignedEstimateRequestId || null,
    isRead: notif.isRead,
  }));

  return {
    notReadCount,
    list,
  };
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