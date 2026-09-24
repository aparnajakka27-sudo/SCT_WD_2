export interface Lap {
  id: number;
  lapTime: number; // Time elapsed during this specific lap in ms
  overallTime: number; // Total elapsed time at the end of this lap in ms
}
