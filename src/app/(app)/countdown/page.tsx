import CountdownFeature from '@/components/countdown-feature';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Countdown Timer | NovaFocus',
};

export default function CountdownPage() {
  return <CountdownFeature />;
}
