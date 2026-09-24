export function formatTimeParts(timeInMs: number) {
  const hours = Math.floor(timeInMs / 3600000).toString().padStart(2, '0');
  const minutes = Math.floor((timeInMs % 3600000) / 60000).toString().padStart(2, '0');
  const seconds = Math.floor((timeInMs % 60000) / 1000).toString().padStart(2, '0');
  const milliseconds = Math.floor(timeInMs % 1000).toString().padStart(3, '0');

  return { hours, minutes, seconds, milliseconds };
}

export function formatTime(timeInMs: number, showHours: boolean = true) {
  const { hours, minutes, seconds, milliseconds } = formatTimeParts(timeInMs);
  
  if (showHours) {
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  }
  return `${minutes}:${seconds}.${milliseconds}`;
}
