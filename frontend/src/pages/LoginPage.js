import { useContext, useState } from "react"
import {Navigate} from "react-router-dom";
import { UserContext } from "../UserContext";

export default function LoginPage(){
    const [username,setUsername]=useState('');
    const [password,setPassword]=useState('');
    const [redirect,setRedirect] = useState(false);
    const {setUserInfo} = useContext(UserContext);

    async function login(ev){
        ev.preventDefault();
        const response = await fetch('https://myblogs-vzdk.onrender.com/login',{
            method:'POST',
            body:JSON.stringify({username,password}),
            headers:{'Content-Type':'application/json'},
            credentials:'include'
        })
        if(response.ok){
            response.json().then(userInfo=>{
                setUserInfo(userInfo);
                setRedirect(true);
            })
        }else{
            alert('wrong credentials');
        }
    }

    if(redirect){
        return <Navigate to={'/'} />
    }

    return(
        <form className="login" onSubmit={login}>
            <h1>Login</h1>
            <input type="text" placeholder="UserName"
                    value={username}
                    onChange={event=>setUsername(event.target.value)}
            />
            <input type="password" placeholder="Password" value={password} onChange={event=>setPassword(event.target.value)}/>
            <button type="submit">Login</button>
        </form>
    )
}