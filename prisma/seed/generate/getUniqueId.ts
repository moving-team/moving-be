// ID 추적을 위한 Set
const usedIds = new Set<number>();

// 유일한 ID 생성 함수
export function generateUniqueId(createCount: number): number {
  let id: number;
  do {
    id = Math.floor(Math.random() * createCount * 2);
  } while (usedIds.has(id));
  usedIds.add(id);
  return id;
}