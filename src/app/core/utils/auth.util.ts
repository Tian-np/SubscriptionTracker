/** Supabase Auth ใช้ email ภายใน — แปลง username เป็น email รูปแบบนี้ */
const AUTH_EMAIL_DOMAIN = 'subtracker.local';

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

export function isValidUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function usernameToEmail(username: string): string {
  return `${normalizeUsername(username)}@${AUTH_EMAIL_DOMAIN}`;
}

export function emailToUsername(email: string | undefined): string {
  if (!email) return '';
  const suffix = `@${AUTH_EMAIL_DOMAIN}`;
  if (email.endsWith(suffix)) {
    return email.slice(0, -suffix.length);
  }
  return email.split('@')[0];
}

export function authErrorMessage(message: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
    'User already registered': 'ชื่อผู้ใช้นี้ถูกใช้แล้ว',
    'Signup requires a valid password': 'รหัสผ่านไม่ถูกต้อง',
    'Password should be at least 6 characters': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
  };
  return map[message] ?? message;
}
