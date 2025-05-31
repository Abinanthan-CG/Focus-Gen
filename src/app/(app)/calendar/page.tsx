
import CalendarFeature from '@/components/calendar-feature';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendar | Focus Gen',
};

export default function CalendarPage() {
  return <CalendarFeature />;
}
