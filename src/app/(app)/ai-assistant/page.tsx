import AiAssistantFeature from '@/components/ai-assistant-feature';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Assistant | NovaFocus',
};

export default function AiAssistantPage() {
  return <AiAssistantFeature />;
}
