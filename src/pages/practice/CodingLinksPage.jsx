import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { collection, getDocs, doc, setDoc } from "firebase/firestore"
import { db, auth } from "@/firebase/firebase"

function CodingLinksPage(){

const { company } = useParams()

const [links,setLinks] = useState([])

useEffect(()=>{

async function loadLinks(){

const userId = auth.currentUser?.uid

let progressMap = {}

if(userId){

const progressSnapshot = await getDocs(
collection(db,"user_progress",userId,"coding")
)

progressSnapshot.forEach(doc=>{
progressMap[doc.id] = doc.data()
})

}

const snapshot = await getDocs(
collection(db,"company_prep",company,"items")
)

const data = snapshot.docs.map(doc=>({
id:doc.id,
...doc.data(),
completed: progressMap[doc.id]?.completed || false
}))

setLinks(data)

}

loadLinks()

},[company])


async function toggleComplete(id,current){

const userId = auth.currentUser?.uid
if(!userId) return

await setDoc(
doc(db,"user_progress",userId,"coding",id),
{
completed: !current,
completedAt: new Date().toISOString()
}
)

setLinks(prev =>
prev.map(p =>
p.id === id
? {...p,completed:!current}
: p
)
)

}

return(

<div className="page">

<h2 className="page-heading">
{company.charAt(0).toUpperCase() + company.slice(1)} Coding Questions
</h2>

<div className="card">

<table className="table">

<thead>

<tr>
<th>#</th>
<th>Problem</th>
<th>Platform</th>
<th>Link</th>
<th>Completed</th>
</tr>

</thead>

<tbody>

{links.map((q,i)=>(

<tr key={q.id}>

<td>{i+1}</td>

<td>{q.title}</td>

<td>{q.platform}</td>

<td>

<a
href={q.link}
target="_blank"
className="solve-btn"
>
Solve
</a>

</td>

<td>

<input
type="checkbox"
checked={q.completed || false}
onChange={()=>toggleComplete(q.id, q.completed || false)}
className="checkbox"
/>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)

}

export default CodingLinksPage