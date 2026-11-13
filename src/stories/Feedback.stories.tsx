import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarClock, Info } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tooltip } from '@/components/ui/Tooltip';
import { Kbd } from '@/components/ui/Kbd';
import { Button } from '@/components/ui/Button';
import { ToastProvider, useToast } from '@/components/ui/Toast';

const meta = {
  title: 'Primitives/Feedback',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  render: () => <EmptyState icon={<CalendarClock />} title="No renewals in the next 90 days" description="Try widening the region or segment filters." action={<Button variant="primary">Clear filters</Button>} />,
};

export const TooltipAndKbd: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Tooltip content="End ARR of accounts active at period start ÷ their starting ARR.">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'help' }}>
          Net revenue retention <Info size={14} />
        </span>
      </Tooltip>
      <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', fontSize: 12, color: 'var(--color-ink-3)' }}>
        Search <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </span>
    </div>
  ),
};

function ToastDemo() {
  const { toast } = useToast();
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button variant="primary" onClick={() => toast('Saved view “EMEA renewals”')}>
        Success toast
      </Button>
      <Button onClick={() => toast('Widget hidden — restore it from Customize', 'info')}>Info toast</Button>
    </div>
  );
}

export const Toasts: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};
