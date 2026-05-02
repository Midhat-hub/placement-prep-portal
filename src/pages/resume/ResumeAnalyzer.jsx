import { useState } from "react";

function ResumeAnalyzer(){

const [file,setFile] = useState(null);
const [result,setResult] = useState(null);

const handleUpload = async () => {

if(!file){
alert("Please upload a resume");
return;
}

const formData = new FormData();
formData.append("file",file);

try{

const response = await fetch("http://localhost:5000/api/full-analysis",{
method:"POST",
body:formData
});

const data = await response.json();
setResult(data);

}
catch(error){
console.error(error);
}

};

return(

<div className="page">

<h1 className="page-heading">
Resume Analyzer
</h1>

<div className="card resume-card">

{/* FILE UPLOAD */}

<div className="upload-box">

<input
type="file"
accept=".pdf,.docx"
onChange={(e)=>setFile(e.target.files[0])}
/>

</div>


{/* ANALYZE BUTTON */}

<button
className="btn full-btn"
onClick={handleUpload}
>
Analyze Resume
</button>


{/* RESULT */}

{result && (

<div className="analysis-result">

<h2>Analysis Result</h2>

<div className="analysis-box">

<pre>
{JSON.stringify(result,null,2)}
</pre>

</div>

</div>

)}

</div>

</div>

);

}

export default ResumeAnalyzer;