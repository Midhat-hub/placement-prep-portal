import { useNavigate } from "react-router-dom"

function CompanyList(){

const navigate = useNavigate()

const companies = [
"deloitte"
]

return(

<div className="page">

<h2 className="page-heading">
Company Preparation
</h2>

<div className="company-grid">

{companies.map((company,i)=>(

<div
key={i}
className="company-card"
onClick={()=>navigate(`/practice/company/${company}`)}
>

<div className="company-icon">
🏢
</div>

<div className="company-name">
{company}
</div>

</div>

))}

</div>

</div>

)

}

export default CompanyList