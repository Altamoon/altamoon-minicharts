export default function formatMoneyNumber(num: number): string {
  if (num >= 100_000_000_000) {
    return `${Math.round(num / 1000_000_000)}b`;
  } if (num >= 10_000_000_000) {
    return `${Math.round(num / 100_000_000) / 10}b`;
  } if (num >= 1_000_000_000) {
    return `${Math.round(num / 10_000_000) / 100}b`;
  } if (num >= 100_000_000) {
    return `${Math.round(num / 1_000_000)}m`;
  } if (num >= 10_000_000) {
    return `${(Math.round(num / 100_000) / 10).toFixed(1)}m`;
  } if (num >= 1_000_000) {
    return `${(Math.round(num / 10_000) / 100).toFixed(2)}m`;
  } if (num >= 100_000) {
    return `${Math.round(num / 1000)}k`;
  } if (num >= 10_000) {
    return `${(Math.round(num / 100) / 10).toFixed(1)}k`;
  } if (num >= 1000) {
    return `${(Math.round(num / 10) / 100).toFixed(2)}k`;
  } if (num >= 100) {
    return `${Math.round(num)}`;
  } if (num >= 10) {
    return `${(Math.round(num * 10) / 10).toFixed(1)}`;
  }
  return `${(Math.round(num * 100) / 100).toFixed(2)}`;
}
