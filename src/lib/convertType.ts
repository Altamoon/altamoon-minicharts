export default function convertType<T>(value: unknown): T {
  return value as T;
}
