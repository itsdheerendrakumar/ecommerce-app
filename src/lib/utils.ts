export { cn } from "cn";

export function getInitials(name?: string): string {
  if (!name) return "U";
  const cleaned = name.trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
}

export function generateTemporaryPassword(length: number = 10): string {
  const targetLength = Math.max(length, 8);

  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specialChars = "!@#$%^&*";
  const allChars = uppercase + lowercase + numbers + specialChars;

  const getRandomChar = (chars: string) =>
    chars[Math.floor(Math.random() * chars.length)];

  const passwordChars = [
    getRandomChar(uppercase),
    getRandomChar(lowercase),
    getRandomChar(numbers),
    getRandomChar(specialChars),
  ];

  for (let i = passwordChars.length; i < targetLength; i++) {
    passwordChars.push(getRandomChar(allChars));
  }

  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join("");
}