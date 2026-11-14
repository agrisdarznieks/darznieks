const TBD = /\[TBD(?:[:\s][^\]]*)?\]/i;

export function containsTbd(value: string): boolean {
  return TBD.test(value);
}

export function tbdFields(strings: { field: string; value: string }[]): string[] {
  return strings.filter((item) => containsTbd(item.value)).map((item) => item.field);
}
