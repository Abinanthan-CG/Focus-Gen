export interface Task {
  id: string;
  text: string;
  completed: boolean;
  date?: string; // ISO string for calendar tasks, e.g., "2023-10-26"
}
