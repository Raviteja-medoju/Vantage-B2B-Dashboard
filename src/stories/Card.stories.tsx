import type { Meta, StoryObj } from '@storybook/react-vite';
import { MoreHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';

const meta = {
  title: 'Data display/Card',
  component: Card,
  tags: ['autodocs'],
  args: { title: 'Pipeline by stage', subtitle: 'Open deals · snapshot', padding: 'md' },
  argTypes: { padding: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] }, flat: { control: 'boolean' } },
  render: (args) => (
    <div style={{ width: 420 }}>
      <Card
        {...args}
        actions={
          <IconButton label="Options" size="sm">
            <MoreHorizontal />
          </IconButton>
        }
        footer="Snapshot as of today"
      >
        <p style={{ margin: 0, color: 'var(--color-ink-2)', fontSize: 13 }}>Card body. Widgets use the specialised WidgetFrame, which adds a drag handle, table-view toggle and size menu.</p>
      </Card>
    </div>
  ),
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
