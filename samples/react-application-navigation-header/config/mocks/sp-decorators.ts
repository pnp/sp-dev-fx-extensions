export function override(target: unknown, propertyKey: string, descriptor: PropertyDescriptor): void {
  return descriptor;
}