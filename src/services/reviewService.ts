import reviewRepository from '../repositories/reviewRepository';
import { CreateReviewInput } from '../types/serviceType';

// GET Review
export async function getReviews(moverId: number, skip: number, take: number) {
  // 리뷰 목록 가져오기
  const reviews = await reviewRepository.findManyByPaginationData({
    paginationParams: { skip, take, where: { moverId } },
    select: {
      id: true,
      score: true,
      description: true,
      createdAt: true,
      Customer: {
        select: {
          User: { select: { name: true } },
        },
      },
    },
  });

  // 리뷰 통계 계산
  const allReviews = await reviewRepository.findManyData({
    where: { moverId },
    select: { score: true },
  });

  // 리뷰별 통계 계산
  const reviewCount: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  allReviews.forEach((review) => {
    const score = review.score.toString();
    if (reviewCount[score]) {
      reviewCount[score]++;
    }
  });

  const stats = {
    totalReviews: allReviews.length,
    reviewCount,
  };

  // 다음 페이지가 있는지 확인 (전체 리뷰 수와 현재 페이지의 리뷰 수로 계산)
  const hasNextPage = allReviews.length > skip + take;

  // 리뷰 목록 데이터 포맷팅
  const formattedReviews = reviews.map((review) => ({
    id: review.id,
    writer: review.Customer?.User.name,
    createAt: review.createdAt,
    score: review.score,
    content: review.description,
  }));

  return {
    reviewStats: stats,
    reviews: {
      hasNextPage,
      list: formattedReviews,
    },
  };
}

// POST Review
export async function createReview(input: CreateReviewInput) {
    const { customerId, estimateId, moverId, score, description } = input;
  
    // 리뷰 중복 여부 확인
    const existingReview = await reviewRepository.findFirstData({
      where: { estimateId },
    });
  
    if (existingReview) {
      throw new Error('이미 해당 견적에 대한 리뷰가 작성되었습니다.');
    }
  
    // 리뷰 생성
    const newReview = await reviewRepository.createData({
      data: {
        customerId,
        estimateId,
        moverId,
        score,
        description,
      },
      select: {
        id: true,
        estimateId: true,
        moverId: true,
        score: true,
        description: true,
        createdAt: true,
      },
    });
  
    return newReview;
  }

// GET reivew/me
export async function getMyReviews(userId: number, skip: number, take: number) {
  // 사용자 작성 리뷰 목록 조회
  const reviews = await reviewRepository.findManyByPaginationData({
    paginationParams: { skip, take, where: { customerId: userId } },
    select: {
      id: true,
      score: true,
      description: true,
      createdAt: true,
      Estimate: {
        select: {
          movingDate: true,
          price: true,
          serviceType: true,
          Mover: {
            select: {
              name: true,
              profileImage: true,
            },
          },
        },
      },
    },
  });

  // 전체 리뷰 수 조회 (페이지네이션 총 갯수 계산)
  const totalReviews = await reviewRepository.countData({
    customerId: userId,
  });

  // 다음 페이지 여부 확인
  const hasNextPage = skip + take < totalReviews;

  // 리뷰 목록 데이터 형식화
  const formattedReviews = reviews.map((review) => ({
    isAssigned: !!(review.Estimate as any)?.id, // Any 타입 임시 지정 (추후 수정해야함)
    createAt: review.createdAt,
    id: review.id,
    moverName: review.Estimate?.Mover?.name || '',
    profileImg: review.Estimate?.Mover?.profileImage || '',
    movingDate: review.Estimate?.movingDate || null,
    price: review.Estimate?.price || null,
    score: review.score,
    content: review.description,
    serviceType: review.Estimate?.serviceType || [],
  }));

  return {
    total: totalReviews,
    hasNextPage,
    list: formattedReviews,
  };
}


// GET review/me
// export async function getMyReviews(userId: number, skip: number, take: number) {
//   // 내가 작성한 리뷰 목록을 가져오기
//   const reviews = await reviewRepository.findManyByPaginationData({
//     paginationParams: { skip, take, where: { customerId: userId } },
//     select: {
//       id: true,
//       score: true,
//       description: true,
//       createdAt: true,
//       movingDate: true,
//       price: true,
//       serviceType: true,
//       Mover: {
//         select: {
//           name: true,
//           profileImg: true,
//         },
//       },
//     },
//   });

//   // 내가 작성한 리뷰에 대한 통계 정보 계산
//   const totalReviews = await reviewRepository.countData({
//     customerId: userId,
//   });

//   // 페이지네이션 상태 확인
//   const hasNextPage = reviews.length === take;

//   return {
//     total: totalReviews,
//     hasNextPage,
//     list: reviews.map((review) => ({
//       isAssigned: !!review.estimateId, // 견적이 지정되었는지 여부
//       createAt: review.createdAt,
//       id: review.id,
//       moverName: review.Mover.name,
//       profileImg: review.Mover.profileImg,
//       movingDate: review.movingDate,
//       price: review.price,
//       score: review.score,
//       content: review.description,
//       serviceType: review.serviceType,
//     })),
//   };
// }