import ClockFeature from '@/components/clock-feature';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clock | NovaFocus',
};

export default function ClockPage() {
  return <ClockFeature />;
}
