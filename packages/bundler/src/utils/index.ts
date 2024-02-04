// 兼容default取值
export function compactDefault(value) {
  return value?.default ?? value;
}

export function makeArray(value) {
  return Array.isArray(value) ? value : [value];
}
