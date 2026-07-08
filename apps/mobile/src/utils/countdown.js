export function countdownLabel(target) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
