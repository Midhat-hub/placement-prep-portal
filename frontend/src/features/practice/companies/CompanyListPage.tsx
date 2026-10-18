import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
export default function CompanyListPage() {
  const company = { id: "deloitte", name: "Deloitte", description: "Deloitte NLA pattern aptitude questions, verbal ability, and coding tracks." };
  return <><PageHeader eyebrow="TARGETED PREPARATION" title="Company-specific preparation" description="Practice verified previous-year material tailored to recruiting organizations." /><div className="company-grid-new"><Link className="company-card-new" to={`/practice/company/${company.id}`}><div className="feature-icon blue"><BriefcaseBusiness size={22} /></div><h3>{company.name}</h3><p>{company.description}</p><span className="text-link">Explore track <ArrowRight size={14} /></span></Link></div></>;
}
