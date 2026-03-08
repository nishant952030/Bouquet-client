export function isWomensDayActive(now = new Date()) {
  const month = now.getMonth(); // 0-based
  const day = now.getDate();
  return month === 2 && day === 8;
}
