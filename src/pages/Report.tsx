import ReportViewer from '../components/ReportViewer';
import { reportMarkdown } from '../reportContent';

export default function Report() {
  return (
    <ReportViewer
      markdown={reportMarkdown}
      title="AI Legaltech Product and Partnership Analysis"
    />
  );
}
