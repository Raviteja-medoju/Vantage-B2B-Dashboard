import { WorkspaceProvider } from '@/state/WorkspaceContext';
import { WorkQueuePage } from '@/pages/WorkQueuePage';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PreferencesProvider } from '@/state/PreferencesContext';
import { LabProvider } from '@/state/LabContext';
import { FiltersProvider } from '@/state/FiltersContext';
import { LayoutProvider } from '@/state/LayoutContext';
import { ToastProvider } from '@/components/ui/Toast';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { AccountDetailPage } from '@/pages/AccountDetailPage';
import { AccountsPage } from '@/pages/AccountsPage';
import { LegacyPage } from '@/pages/LegacyPage';
import { CaseStudyPage } from '@/pages/CaseStudyPage';

export function App() {
  return (
    <PreferencesProvider>
      <LabProvider>
        <FiltersProvider>
          <LayoutProvider>
            <ToastProvider>
              <WorkspaceProvider><BrowserRouter>
                <Routes>
                  <Route element={<AppShell />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="work" element={<WorkQueuePage />} /><Route path="accounts" element={<AccountsPage />} /><Route path="accounts/:accountId" element={<AccountDetailPage />} />
                    <Route path="legacy" element={<LegacyPage />} />
                    <Route path="case-study" element={<CaseStudyPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </BrowserRouter></WorkspaceProvider>
            </ToastProvider>
          </LayoutProvider>
        </FiltersProvider>
      </LabProvider>
    </PreferencesProvider>
  );
}


