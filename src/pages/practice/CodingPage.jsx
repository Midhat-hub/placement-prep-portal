import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/firebase/firebase"

function CodingPage(){

  const { collectionName } = useParams()

  const [links,setLinks] = useState([])

  useEffect(()=>{

    async function load(){

      const snapshot = await getDocs(
        collection(db,"coding_links",collectionName,"items")
      )

      const data = snapshot.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
      }))

      setLinks(data)

    }

    load()

  },[collectionName])

  return(

<div
style={{
  minHeight:"100vh",
  background:"#f0fdf4",
  padding:"40px",
  marginLeft:"70px",
  display:"flex",
  justifyContent:"center"
}}
>

<div
style={{
  width:"100%",
  maxWidth:"800px",
  background:"white",
  padding:"35px",
  borderRadius:"14px",
  boxShadow:"0 8px 20px rgba(0,0,0,0.08)",
  border:"1px solid #d1fae5"
}}
>

<h2
style={{
  color:"#065f46",
  marginBottom:"30px"
}}
>
Coding Practice
</h2>


{links.map((item,i)=>(

<div
key={i}
style={{
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",
  padding:"15px",
  border:"1px solid #d1fae5",
  borderRadius:"10px",
  marginBottom:"12px",
  background:"#ecfdf5"
}}
>

<span
style={{
  fontWeight:"500",
  color:"#065f46"
}}
>
{i+1}. {item.title}
</span>

<a
href={item.link}
target="_blank"
style={{
  padding:"8px 14px",
  background:"#10b981",
  color:"white",
  borderRadius:"6px",
  textDecoration:"none",
  fontSize:"13px",
  fontWeight:"500"
}}
>
Solve
</a>

</div>

))}

</div>

</div>

  )

}

export default CodingPage