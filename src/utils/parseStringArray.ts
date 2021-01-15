export function parseStringArray(value: unknown, name: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`Expected ${name} to be an array. Got ${typeof value}.`);
  }

  const invalidIndex = value.findIndex((value) => typeof value !== "string");
  if (invalidIndex !== -1) {
    throw new Error(
      `Expected ${name}[${invalidIndex}] value to be a string. Got ${typeof value[
        invalidIndex
      ]}.`
    );
  }

  return value;
}
