import { useState } from "react";
import { auth } from "@/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Login(){

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const navigate = useNavigate();

const handleLogin = async (e)=>{

e.preventDefault();

try{

await signInWithEmailAndPassword(auth,email,password);

navigate("/dashboard");

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

<div className="login-left-content">

<h1>Welcome Students!</h1>

<h3>Your placement preparation starts here.</h3>


</div>

</div>



{/* RIGHT PANEL */}

<div className="login-right">

<h2 className="login-title">Login</h2>

<form onSubmit={handleLogin}>

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
Login
</button>

</form>

<p className="signup-text">
New student?
<button
className="signup-btn"
onClick={()=>navigate("/signup")}
>
Create account
</button>
</p>

</div>

</div>

</div>

)

}

export default Login;