import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db, auth } from "@/firebase/firebase"

function QuestionPage(){

const { collectionName, id } = useParams()
const navigate = useNavigate()

const [question,setQuestion] = useState(null)
const [selected,setSelected] = useState(null)
const [result,setResult] = useState(null)

const [startTime] = useState(Date.now())

useEffect(()=>{

async function load(){

let ref

if(collectionName === "company_aptitude"){
ref = doc(db,"company_prep","company_aptitude","items",id)
}
else{
ref = doc(db,"questions",collectionName,"items",id)
}

const snapshot = await getDoc(ref)

if(snapshot.exists()){
setQuestion(snapshot.data())
}

}

load()

},[collectionName,id])


async function submitAnswer(){

const correct = selected === question.answer

setResult(correct ? "Correct" : "Wrong")

const endTime = Date.now()
const timeTaken = Math.floor((endTime - startTime) / 1000)

const userId = auth.currentUser?.uid

if(userId){

await setDoc(
doc(db,"user_progress",userId,"attempts",id),
{
correct,
timeTaken,
attemptedAt:new Date().toISOString()
}
)

}

}

if(!question){
return <h2 className="loading">Loading...</h2>
}

return(

<div className="page">

<h2 className="page-heading">Question</h2>

<div className="card">

<div className="question-box">
{question.question}
</div>


{/* OPTIONS */}

{question.options?.map((opt,i)=>(

<button
key={i}
className={`option-btn ${selected===opt ? "option-selected":""}`}
onClick={()=>setSelected(opt)}
>

{opt}

</button>

))}


{/* SUBMIT */}

<button
className="btn full-btn"
onClick={submitAnswer}
>
Submit Answer
</button>


{/* RESULT */}

{result && (

<h3
className={`result-text ${result==="Correct" ? "correct" : "wrong"}`}
>

{result}

</h3>

)}


{/* NEXT QUESTION (logic pending)

<button className="btn full-btn" onClick={nextQuestion}>
Next Question →
</button>

*/}


{/* BACK */}

<button
className="btn btn-secondary full-btn"
onClick={()=>navigate(-1)}
>

← Back

</button>

</div>

</div>

)

}

export default QuestionPage