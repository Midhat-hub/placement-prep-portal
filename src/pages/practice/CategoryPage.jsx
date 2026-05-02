import { useParams, useNavigate } from "react-router-dom"

function CategoryPage(){

const { category } = useParams()
const navigate = useNavigate()

const data = {

aptitude: [
{name:"Quantitative", route:"aptitude", type:"arithmetic", icon:"🔢"},
{name:"Logical", route:"aptitude", type:"logical", icon:"🧠"},
{name:"Verbal", route:"aptitude", type:"verbal", icon:"📝"}
],

core: [
{name:"Operating Systems", route:"core_subjects", type:"OS", icon:"💻"},
{name:"DBMS", route:"core_subjects", type:"DBMS", icon:"🗄️"},
{name:"OOP", route:"core_subjects", type:"OOP", icon:"📦"},
{name:"Computer Networks", route:"core_subjects", type:"CN", icon:"🌐"}
],

dsa: [
{name:"DSA MCQ", route:"dsa", icon:"📊"},
{name:"DSA Coding", route:"dsa", icon:"⚡"}
]

}

const items = data[category] || []

return(

<div className="page">

<h2 className="page-heading">
{category.charAt(0).toUpperCase() + category.slice(1)} Practice
</h2>

<div className="category-grid">

{items.map((item,i)=>(

<div
key={i}
className="category-card"

onClick={()=>{

if(item.type){
navigate(`/practice/questions/${item.route}?type=${item.type}`)
}
else{
navigate(`/practice/questions/${item.route}`)
}

}}
>

<div className="category-icon">
{item.icon}
</div>

<div className="category-title">
{item.name}
</div>

</div>

))}

</div>

</div>

)

}

export default CategoryPage