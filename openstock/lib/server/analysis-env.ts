import 'server-only';
export const mockEnabled = () => process.env.USE_MOCK === 'true';
export function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`설정 필요: ${name}`);
  return value;
}
