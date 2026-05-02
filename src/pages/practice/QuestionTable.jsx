import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db, auth } from "@/firebase/firebase"

function QuestionTable(){

const { collectionName } = useParams()
const navigate = useNavigate()

const [searchParams] = useSearchParams()
const type = searchParams.get("type")

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
collection(db,"questions",collectionName,"items")
)

const data = snapshot.docs.map(doc=>({
id:doc.id,
...doc.data(),
progress:progressMap[doc.id] || null
}))

let filtered = data

if(type){

if(collectionName === "aptitude"){
filtered = data.filter(q => q.category === type)
}

if(collectionName === "core_subjects"){
filtered = data.filter(q => q.subject === type)
}

}

setQuestions(filtered)

}

load()

},[collectionName,type])


return(

<div className="page">

<h2 className="page-heading">
{collectionName.replace("_"," ")} Questions
</h2>

<div className="card">

<table className="table">

<thead>

<tr>
<th>#</th>
<th>Question</th>
<th>Topic</th>
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
onClick={()=>navigate(`/practice/question/${collectionName}/${q.id}`)}
>

<td>{i+1}</td>

<td className="question-col">
{q.question}
</td>

<td>{q.topic || q.category || "-"}</td>

<td>{q.difficulty || "-"}</td>

<td>
{q.progress ? "✔" : "-"}
</td>

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

export default QuestionTable