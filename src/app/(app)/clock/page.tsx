
import ClockFeature from '@/components/clock-feature';
import WorldClocksDisplay from '@/components/world-clocks-display';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clock | Focus Gen',
};

export default function ClockPage() {
  return (
    <div className="flex flex-col items-center gap-8">
      <ClockFeature />
      <WorldClocksDisplay />
    </div>
  );
}
