import { addressList } from '../dummy/addressList';

let usedAddress: string[] = [];

export function getRandomAddress(): string {
  const availableAddress = addressList.filter(
    (address) => !usedAddress.includes(address)
  );

  if (availableAddress.length === 0) {
    usedAddress = [];
    return getRandomAddress();
  }

  const randomIndex = Math.floor(Math.random() * availableAddress.length);
  const selectedAddress = availableAddress[randomIndex];

  usedAddress.push(selectedAddress); // 선택된 Introduce 기록

 
  return selectedAddress;
}

console.log(getRandomAddress());