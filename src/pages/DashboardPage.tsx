import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useLab } from '@/state/LabContext';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { FilterBar } from '@/components/filters/FilterBar';
import { LegacyFilterBar } from '@/components/filters/LegacyFilterBar';
import { PortfolioBrief } from '@/components/widgets/PortfolioBrief';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';
import { CustomizeDrawer } from '@/components/widgets/CustomizeDrawer';
import s from './DashboardPage.module.css';

export function DashboardPage() {
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const { filterVariant } = useLab();

  return (
    <div className={s.page}>
      <PageHeader
        title="Revenue overview"
        description="Your business at a glance. Turn customer signals into confident decisions."
        actions={
          <Button variant="secondary" iconLeft={<SlidersHorizontal />} onClick={() => setCustomizeOpen(true)}>
            Customize
          </Button>
        }
      />
      {filterVariant === 'B' ? <FilterBar /> : <LegacyFilterBar />}
      <PortfolioBrief /><div className={s.grid}>
        <WidgetGrid onCustomize={() => setCustomizeOpen(true)} />
      </div>
      <CustomizeDrawer open={customizeOpen} onClose={() => setCustomizeOpen(false)} />
    </div>
  );
}

