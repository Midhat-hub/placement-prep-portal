import { useNavigate } from "react-router-dom"

function PracticeHome(){

const navigate = useNavigate()

const sections = [
{name:"Company Specific Questions", route:"/practice/company", icon:"🏢"},
{name:"General Aptitude", route:"/practice/aptitude", icon:"🔢"},
{name:"Core Subjects", route:"/practice/core", icon:"💻"},
{name:"DSA Practice", route:"/practice/dsa", icon:"⚡"}
]

return(

<div className="page">

<h1 className="page-heading">
Practice Hub
</h1>

<div className="practice-grid">

{sections.map((item,i)=>(

<div
key={i}
className="practice-card"
onClick={()=>navigate(item.route)}
>

<div className="practice-icon">
{item.icon}
</div>

<div className="practice-title">
{item.name}
</div>

</div>

))}

</div>

</div>

)

}

export default PracticeHome