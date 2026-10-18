import { ArrowRight, Brain, Code2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";

export default function CompanyPage() {
  const { company = "company" } = useParams();
  const name = company.charAt(0).toUpperCase() + company.slice(1);
  return <><PageHeader eyebrow="RECRUITMENT TRACK" title={`${name} placement preparation`} description="Choose a real preparation collection to continue." /><div className="company-grid-new"><Link className="company-card-new" to={`/practice/company/${company}/aptitude`}><div className="feature-icon orange"><Brain size={22} /></div><h3>Aptitude & technical MCQs</h3><p>Practice the aptitude material stored for company preparation.</p><span className="text-link">Open aptitude practice <ArrowRight size={14} /></span></Link><Link className="company-card-new" to={`/practice/coding/${company}`}><div className="feature-icon violet"><Code2 size={22} /></div><h3>Coding practice problems</h3><p>Track the company coding links and completion status.</p><span className="text-link">Open coding track <ArrowRight size={14} /></span></Link></div></>;
}
