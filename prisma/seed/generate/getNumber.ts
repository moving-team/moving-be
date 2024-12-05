const generatedPhoneNumbers = new Set<string>();

export function generateUniquePhoneNumber(): string {
  const prefix = "010"; 

  const generateRandomDigits = (length: number): string => {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
  };

  let phoneNumber: string;

  do {
    const middle = generateRandomDigits(4);
    const last = generateRandomDigits(4);  
    phoneNumber = `${prefix}${middle}${last}`;
  } while (generatedPhoneNumbers.has(phoneNumber));

  generatedPhoneNumbers.add(phoneNumber);
  return phoneNumber;
}

// console.log(generateUniquePhoneNumber());
