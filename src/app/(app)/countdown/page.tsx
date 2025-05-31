
import CountdownFeature from '@/components/countdown-feature';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Timer | Focus Gen',
};

export default function CountdownPage() {
  return <CountdownFeature />;
}
