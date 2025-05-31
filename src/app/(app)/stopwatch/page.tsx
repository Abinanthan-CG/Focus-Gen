
import StopwatchFeature from '@/components/stopwatch-feature';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stopwatch | Focus Gen',
};

export default function StopwatchPage() {
  return <StopwatchFeature />;
}
