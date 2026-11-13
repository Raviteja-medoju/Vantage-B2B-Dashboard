import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '@/components/ui/Avatar';

const meta = {
  title: 'Primitives/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: { name: 'Priya Raman', size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] } },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Team: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {['Priya Raman', 'Diego Álvarez', 'Hannah Osei', 'Tomasz Nowak', 'Mei Lin', 'Jordan Blake', 'Amara Nwosu', 'Lucas Moreau'].map((n) => (
        <Avatar key={n} name={n} />
      ))}
    </div>
  ),
};
