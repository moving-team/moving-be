import prisma from '../config/prisma';
import estimateRepository from '../repositories/estimateRepository';
import notificationRepository from '../repositories/notificationRepository';
import { createNotificationContents } from '../utils/createNotificationContents';
import { todayUTC } from '../utils/dateUtil';
import { estimateWithMovingInfoAndCustomerUserAndMoverUserAndEstimateReqIdSelect } from './selects/estimateSelect';

// 이사 전날 확인 알람 생성 API
async function sendMovingDayReminder() {
  const todayString = todayUTC();
  const todayTime = new Date(todayString).getTime();
  const oneDaysLaterTime = todayTime + 1000 * 60 * 60 * 24;
  const oneDaysLater = new Date(oneDaysLaterTime).toISOString();
  const twoDaysLaterTime = todayTime + 1000 * 60 * 60 * 48;
  const twoDaysLater = new Date(twoDaysLaterTime).toISOString();

  const estimateList = await estimateRepository.findManyData({
    where: {
      status: 'ACCEPTED',
      isMovingComplete: false,
      MovingInfo: {
        movingDate: {
          gte: oneDaysLater, // 다음날 이상
          lt: twoDaysLater, // 다다음날 미만
        },
      },
    },
    select:
      estimateWithMovingInfoAndCustomerUserAndMoverUserAndEstimateReqIdSelect,
  });

  const data = estimateList.flatMap((estimate) => {
    const { MovingInfo, Customer, Mover, EstimateRequest, ...rest } = estimate;
    const contents = createNotificationContents({
      type: '1-day',
      departure: MovingInfo.departure,
      arrival: MovingInfo.arrival,
    }) as string;

    return [
      {
        userId: Mover.User.id,
        estimateRequestId: EstimateRequest.id,
        estimateId: rest.id,
        contents,
      },
      {
        userId: Customer.User.id,
        estimateRequestId: EstimateRequest.id,
        estimateId: rest.id,
        contents,
      },
    ];
  });

  await notificationRepository.createManyData({ data });
}

export default { sendMovingDayReminder };
