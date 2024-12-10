import favoriteRepository from '../repositories/favoriteRepository';

export async function toggleFavorite(customerId: number, moverId: number) {
  // 기존 찜 체크
  const existingFavorite = await favoriteRepository.findFirstData({
    where: { customerId, moverId },
    select: { id: true },
  });

  if (existingFavorite) { // 데이터 삭제
    await favoriteRepository.deleteData({ id: existingFavorite.id });
    return { isFavorite: false }; // 상태 반환이 필요할지??
  } else { // 데이터 생성

    await favoriteRepository.createData({
      data: { customerId, moverId },
    });
    return { isFavorite: true }; // 상태 반환이 필요할지??
  }
}