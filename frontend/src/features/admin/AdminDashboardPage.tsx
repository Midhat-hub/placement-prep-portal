import { BookOpen, CalendarClock, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";

export default function AdminDashboardPage() {
  return <><PageHeader eyebrow="ADMINISTRATION" title="Placement operations" description="Manage question inventory and assessment workflows from one workspace." /><div className="continue-grid"><Link className="continue-card" to="/question-bank"><div className="feature-icon blue"><BookOpen size={21} /></div><div><h3>Question bank</h3><p>Review the curriculum question inventory.</p></div></Link><Link className="continue-card" to="/admin/upcoming-mocks"><div className="feature-icon orange"><CalendarClock size={21} /></div><div><h3>Upcoming mocks</h3><p>Review scheduled assessments.</p></div></Link><Link className="continue-card" to="/create-mock"><div className="feature-icon violet"><ClipboardList size={21} /></div><div><h3>Create mock</h3><p>Build an assessment from available questions.</p></div></Link></div></>;
}
