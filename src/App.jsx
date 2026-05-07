import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CVEditor from './pages/CVEditor.jsx';
import Settings from './pages/Settings.jsx';
import Results from './pages/Results.jsx';
import Tracker from './pages/Tracker.jsx';
import Insights from './pages/Insights.jsx';
import History from './pages/History.jsx';
import Automation from './pages/Automation.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cv" element={<CVEditor />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/results" element={<Results />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/history" element={<History />} />
          <Route path="/automation" element={<Automation />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
