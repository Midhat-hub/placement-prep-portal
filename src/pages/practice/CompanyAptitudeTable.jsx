import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db, auth } from "@/firebase/firebase"

function CompanyAptitudeTable(){

const { company } = useParams()
const navigate = useNavigate()

const [questions,setQuestions] = useState([])

useEffect(()=>{

async function load(){

const userId = auth.currentUser?.uid

let progressMap = {}

if(userId){

const progressSnapshot = await getDocs(
collection(db,"user_progress",userId,"attempts")
)

progressSnapshot.forEach(doc=>{
progressMap[doc.id] = doc.data()
})

}

const snapshot = await getDocs(
collection(db,"company_prep","company_aptitude","items")
)

const data = snapshot.docs.map(doc=>({
id:doc.id,
...doc.data(),
progress:progressMap[doc.id] || null
}))

const filtered = data.filter(
q => (q.company || "").toLowerCase() === company.toLowerCase()
)

setQuestions(filtered)

}

load()

},[company])

return(

<div className="page">

<h2 className="page-heading">
{company.charAt(0).toUpperCase() + company.slice(1)} Aptitude Questions
</h2>

<div className="card">

<table className="table">

<thead>

<tr>
<th>#</th>
<th>Question</th>
<th>Difficulty</th>
<th>Attempted</th>
<th>Accuracy</th>
<th>Time</th>
</tr>

</thead>

<tbody>

{questions.map((q,i)=>(

<tr
key={q.id}
onClick={()=>navigate(`/practice/question/company_aptitude/${q.id}`)}
>

<td>{i+1}</td>

<td className="question-col">
{q.question}
</td>

<td>{q.difficulty}</td>

<td>{q.progress ? "✔" : "-"}</td>

<td>
{q.progress
? q.progress.correct ? "100%" : "0%"
: "-"
}
</td>

<td>
{q.progress
? `${q.progress.timeTaken}s`
: "-"
}
</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)

}

export default CompanyAptitudeTable