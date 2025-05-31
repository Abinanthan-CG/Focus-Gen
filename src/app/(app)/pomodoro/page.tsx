
import PomodoroFeature from '@/components/pomodoro-feature';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pomodoro Timer | Focus Gen',
};

export default function PomodoroPage() {
  return <PomodoroFeature />;
}
