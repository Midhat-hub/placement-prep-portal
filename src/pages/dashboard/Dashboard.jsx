import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db, auth } from "@/firebase/firebase"

import {
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
CartesianGrid,
PieChart,
Pie,
Cell
} from "recharts"

function Dashboard(){

const [stats,setStats] = useState({
aptitude:0,
core:0,
dsa:0,
coding:0
})

const [accuracy,setAccuracy] = useState({
correct:0,
wrong:0
})

useEffect(()=>{

async function load(){

const userId = auth.currentUser?.uid
if(!userId) return

const snapshot = await getDocs(
collection(db,"user_progress",userId,"attempts")
)

let aptitude = 0
let core = 0
let dsa = 0
let correct = 0
let wrong = 0

snapshot.forEach(doc=>{

const data = doc.data()

if(data.correct) correct++
else wrong++

const id = doc.id

if(id.includes("apt")) aptitude++
else if(id.includes("core")) core++
else dsa++

})

const codingSnapshot = await getDocs(
collection(db,"user_progress",userId,"coding")
)

const coding = codingSnapshot.size

setStats({
aptitude,
core,
dsa,
coding
})

setAccuracy({
correct,
wrong
})

}

load()

},[])

const barData = [
{name:"DSA", value:stats.dsa},
{name:"Aptitude", value:stats.aptitude},
{name:"Core", value:stats.core},
{name:"Coding", value:stats.coding}
]

const pieData = [
{name:"Correct", value:accuracy.correct},
{name:"Wrong", value:accuracy.wrong}
]

const COLORS = ["#0a6b99","#ef4444"]

return(

<div className="page">

<h1 className="page-heading">
Dashboard
</h1>


{/* STATS CARDS */}

<div className="stats-grid">

<div className="stats-card">
<h3>DSA</h3>
<p>{stats.dsa}</p>
</div>

<div className="stats-card">
<h3>Aptitude</h3>
<p>{stats.aptitude}</p>
</div>

<div className="stats-card">
<h3>Core</h3>
<p>{stats.core}</p>
</div>

<div className="stats-card">
<h3>Coding</h3>
<p>{stats.coding}</p>
</div>

</div>


{/* CHART SECTION */}

<div className="card chart-card">

<div className="chart-container">

<BarChart width={400} height={300} data={barData}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="name" />
<YAxis />
<Tooltip />
<Bar dataKey="value" fill="#0a6b99" />
</BarChart>

<PieChart width={300} height={300}>
<Pie
data={pieData}
cx="50%"
cy="50%"
outerRadius={100}
dataKey="value"
>
{pieData.map((entry,index)=>(
<Cell key={index} fill={COLORS[index]} />
))}
</Pie>
<Tooltip />
</PieChart>

</div>

</div>

</div>

)

}

export default Dashboard