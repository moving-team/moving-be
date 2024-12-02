import moverRepository from '../repositories/moverRepository';

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

export { createMover };