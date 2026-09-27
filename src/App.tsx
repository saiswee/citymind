import { Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { ToastProvider } from '@/lib/toast';
import Dashboard from '@/pages/Dashboard';
import StartProject from '@/pages/StartProject';
import Explore from '@/pages/Explore';
import HowItWorks from '@/pages/HowItWorks';
import ProjectLayout from '@/pages/ProjectLayout';
import Overview from '@/pages/project/Overview';
import Evidence from '@/pages/project/Evidence';
import Timeline from '@/pages/project/Timeline';
import Analysis from '@/pages/project/Analysis';
import SolutionDesign from '@/pages/project/SolutionDesign';
import Blueprint from '@/pages/project/Blueprint';
import BuildWithBob from '@/pages/project/BuildWithBob';

export default function App() {
  return (
    <ToastProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<StartProject />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/projects/:id" element={<ProjectLayout />}>
            <Route index element={<Overview />} />
            <Route path="evidence" element={<Evidence />} />
            <Route path="timeline" element={<Timeline />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="solution" element={<SolutionDesign />} />
            <Route path="blueprint" element={<Blueprint />} />
            <Route path="build" element={<BuildWithBob />} />
          </Route>
        </Routes>
      </AppShell>
    </ToastProvider>
  );
}
