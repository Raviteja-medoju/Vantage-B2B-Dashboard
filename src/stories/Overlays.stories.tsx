import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowDown, ArrowUp, EyeOff, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Menu } from '@/components/ui/Menu';
import { Popover } from '@/components/ui/Popover';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';

const meta = {
  title: 'Overlays/Popover, Menu, Drawer, Modal',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const PopoverStory: Story = {
  name: 'Popover',
  render: () => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLButtonElement | null>(null);
    return (
      <>
        <Button ref={ref} onClick={() => setOpen((o) => !o)} aria-haspopup="dialog" aria-expanded={open}>
          Open popover
        </Button>
        <Popover open={open} onClose={() => setOpen(false)} anchorRef={ref} padding="md" ariaLabel="Example">
          <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <strong>Positioned with floating-ui</strong>
            <p style={{ fontSize: 13, color: 'var(--color-ink-2)', margin: 0 }}>Flips and shifts to stay in view, traps focus on open, closes on Escape and outside click, returns focus to the trigger.</p>
            <Switch checked onChange={() => undefined} label="Example switch" size="sm" />
          </div>
        </Popover>
      </>
    );
  },
};

export const MenuStory: Story = {
  name: 'Menu',
  render: () => {
    const [open, setOpen] = useState(false);
    const [size, setSize] = useState('md');
    const ref = useRef<HTMLButtonElement | null>(null);
    return (
      <>
        <IconButton ref={ref} label="Widget options" variant="secondary" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
          <MoreHorizontal />
        </IconButton>
        <Menu
          open={open}
          onClose={() => setOpen(false)}
          anchorRef={ref}
          placement="bottom-start"
          ariaLabel="Widget options"
          items={[
            { type: 'label', key: 'size', label: 'Size' },
            { key: 'sm', label: 'Small', checked: size === 'sm', onSelect: () => setSize('sm') },
            { key: 'md', label: 'Medium', checked: size === 'md', onSelect: () => setSize('md') },
            { key: 'lg', label: 'Large', checked: size === 'lg', onSelect: () => setSize('lg') },
            { type: 'separator', key: 's1' },
            { key: 'up', label: 'Move up', icon: <ArrowUp /> },
            { key: 'down', label: 'Move down', icon: <ArrowDown />, disabled: true },
            { type: 'separator', key: 's2' },
            { key: 'hide', label: 'Hide widget', icon: <EyeOff />, description: 'Restore it from Customize', danger: true },
          ]}
        />
      </>
    );
  },
};

export const DrawerStory: Story = {
  name: 'Drawer',
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Open drawer
        </Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          title="Customize dashboard"
          description="Show, hide, resize and reorder widgets."
          footer={
            <>
              <Button variant="ghost">Reset to default</Button>
              <Button variant="primary" onClick={() => setOpen(false)}>
                Done
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Switch checked onChange={() => undefined} label="Key metrics" description="Revenue" size="sm" />
            <Switch checked onChange={() => undefined} label="ARR trend" description="Revenue" size="sm" />
            <Switch checked={false} onChange={() => undefined} label="Quota attainment" description="Pipeline" size="sm" />
          </div>
        </Drawer>
      </>
    );
  },
};

export const ModalStory: Story = {
  name: 'Modal',
  render: () => {
    const [open, setOpen] = useState(false);
    const [legacy, setLegacy] = useState(false);
    return (
      <>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            variant="primary"
            onClick={() => {
              setLegacy(false);
              setOpen(true);
            }}
          >
            Open modal
          </Button>
          <Button
            onClick={() => {
              setLegacy(true);
              setOpen(true);
            }}
          >
            Open legacy-styled modal (variant A)
          </Button>
        </div>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          legacy={legacy}
          title={legacy ? 'Report filters' : 'Delete saved view?'}
          description={legacy ? 'Changes take effect when you click Apply.' : 'This removes “EMEA renewal risk” for everyone on this device.'}
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant={legacy ? 'primary' : 'danger'} onClick={() => setOpen(false)}>
                {legacy ? 'Apply' : 'Delete view'}
              </Button>
            </>
          }
        >
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-ink-2)' }}>{legacy ? 'Eight single-select dropdowns lived here. Only one value per field could be chosen.' : 'Saved views are stored locally and can be recreated at any time.'}</p>
        </Modal>
      </>
    );
  },
};
