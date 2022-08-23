export default function formatWithCommas (num) {
  if (!num) return '';
  return Number(num)?.toLocaleString([], {});
}