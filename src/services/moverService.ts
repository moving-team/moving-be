import moverRepository from '../repositories/moverRepository';

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

export { createMover, patchMoverProfile, getMover };
