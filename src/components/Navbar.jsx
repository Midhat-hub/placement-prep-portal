import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

function Navbar(){

const [open,setOpen] = useState(false)

const navigate = useNavigate()
const location = useLocation()

function isActive(path){
return location.pathname.startsWith(path)
}

return(

<div
className="sidebar"
style={{ width: open ? "220px" : "70px" }}
onMouseEnter={()=>setOpen(true)}
onMouseLeave={()=>setOpen(false)}
>

{/* MAIN NAV */}

<div className="nav-section">

<button
className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}
onClick={()=>navigate("/dashboard")}
>
<span className="icon">🏠</span>
{open && <span>Dashboard</span>}
</button>


<button
className={`nav-item ${isActive("/practice") ? "active" : ""}`}
onClick={()=>navigate("/practice")}
>
<span className="icon">📚</span>
{open && <span>Practice</span>}
</button>


<button
className={`nav-item ${isActive("/resume") ? "active" : ""}`}
onClick={()=>navigate("/resume")}
>
<span className="icon">📄</span>
{open && <span>Resume</span>}
</button>


<button className="nav-item disabled">
<span className="icon">📝</span>
{open && <span>Mock Test</span>}
</button>

</div>


{/* BOTTOM NAV */}

<div className="nav-bottom">

<button className="nav-item disabled">
<span className="icon">👤</span>
{open && <span>Profile</span>}
</button>

<button className="nav-item disabled">
<span className="icon">⚙️</span>
{open && <span>Settings</span>}
</button>

</div>

</div>

)

}

export default Navbar