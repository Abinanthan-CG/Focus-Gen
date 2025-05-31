
import TodoFeature from '@/components/todo-feature';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'To-Do List | Focus Gen',
};

export default function TodoPage() {
  return <TodoFeature />;
}
