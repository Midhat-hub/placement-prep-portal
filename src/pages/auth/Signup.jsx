import { useState } from "react";
import { auth } from "@/firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Signup() {

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const navigate = useNavigate();

const handleSignup = async (e) => {

e.preventDefault();

try {

await createUserWithEmailAndPassword(auth,email,password);

alert("User created successfully");

// redirect to login
navigate("/");

}

catch(error){

alert(error.message);

}

};

return(

<div className="login-page">

<div className="login-card">

{/* LEFT PANEL */}

<div className="login-left">

<h1>Join Us!</h1>

<h2>Student Signup</h2>

<p>
Create your account to access the placement preparation portal.
</p>

</div>


{/* RIGHT PANEL */}

<div className="login-right">

<h2 className="login-title">Signup</h2>

<form onSubmit={handleSignup}>

<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
/>

<button type="submit">
Create Account
</button>

</form>


{/* BACK BUTTON */}

<div style={{marginTop:"20px"}}>

<button
onClick={()=>navigate("/")}
style={{
background:"transparent",
color:"#052f3f",
border:"1px solid #052f3f",
width:"100%"
}}
>
Back to Login
</button>

</div>

</div>

</div>

</div>

);

}

export default Signup;