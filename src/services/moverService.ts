import moverRepository from '../repositories/moverRepository';
import favoriteRepository from '../repositories/favoriteRepository';
import assignedEstimateRequestRepository from '../repositories/assignedEstimateRequestRepository';
import estimateRequestRepository from '../repositories/estimateRequestRepository';
import customerRepository from '../repositories/customerRepository';


const getMoverDetail = async (userId: number, moverId: number) => {
    const moverData = await moverRepository.findFirstData({ 
        where: { id: moverId }, 
        select: {
            id: true,
            userId: true,
            profileImage: true,
            nickname: true,
            career: true,
            summary: true,
            description: true,
            confirmationCount: true,
            serviceType: true,
            serviceRegion: true,
            Review: {
                select: {
                    score: true,
                }
            },
        }
    });
    const favoriteCount = await favoriteRepository.countData({ moverId: moverData?.id } );
    const customerData = await customerRepository.findFirstData({ where: { userId: userId } });
    const estimateReqData = await estimateRequestRepository.findFirstData({ where: { customerId: customerData?.id } });
    const isAssigned = estimateReqData 
        ? !!(await assignedEstimateRequestRepository.findFirstData({ where: { estimateRequestId: estimateReqData.id } }))
        : false;

    if (moverData && moverData.Review) {
        const reviews = moverData.Review;
        const avgScore = reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length;
        const reviewCount = reviews.length;
        
        const { Review, ...moverDataWithoutReviews } = moverData;
        
        return {
            ...moverDataWithoutReviews,
            reviewStats: {
                averageScore: avgScore,
                totalReviews: reviewCount
            },
            favoriteCount: favoriteCount,
            isAssigned: isAssigned
        };
    }

    return moverData;
}

const getMover = async (userId: number) => {
    const moverData = await moverRepository.findFirstData({ where: { userId: userId }, select: {
        id: true,
        userId: true,
        profileImage: true,
        nickname: true,
        career: true,
        summary: true,
        description: true,
        confirmationCount: true,
        serviceType: true,
        serviceRegion: true,
        User: {
            select: {
                name: true,
            }
        }
    }});
    return moverData;
}

const createMover = async (userId: number) => {
    const data = {
        userId : userId,
        nickname : '',
        summary : '',
        description : '',
        career : 0,
        confirmationCount : 0,
    }
    const moverData = await moverRepository.createData({ data });
    return moverData;
}

const patchMoverProfile = async (userId: number, updateData: any) => {
    const moverData = await moverRepository.findFirstData({ where: { userId: userId } });
    if(!moverData) {
        throw new Error("프로필 생성하지 않음");
    }
    const patchData = {
        profileImage : updateData.profileImage,
        nickname : updateData.nickname,
        summary : updateData.summary,
        description : updateData.description,
        career : updateData.career,
    }
    await moverRepository.updateData({ where: { id: moverData.id }, data: patchData });
}

export { createMover, patchMoverProfile, getMover,getMoverDetail};
