import { useParams, useNavigate } from "react-router-dom"

function CompanyPage(){

const { company } = useParams()
const navigate = useNavigate()

return(

<div className="page">

<h2 className="page-heading">
{company.charAt(0).toUpperCase() + company.slice(1)} Preparation
</h2>

<div className="company-actions">

<div
className="company-action-card"
onClick={()=>navigate(`/practice/company/${company}/aptitude`)}
>

<div className="action-icon">🧠</div>

<div className="action-title">
Aptitude Questions
</div>

</div>


<div
className="company-action-card"
onClick={()=>navigate(`/practice/coding/${company}`)}
>

<div className="action-icon">💻</div>

<div className="action-title">
Coding Questions
</div>

</div>

</div>

</div>

)

}

export default CompanyPage