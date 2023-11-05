import {useState} from "react";

export default function RegisterPage(){
    const [username,setUsername]=useState('');
    const [password,setPassword]=useState('');

    async function register(event){
        event.preventDefault();
        const res = await fetch('http://localhost:4000/register',{
            method:'POST',
            body:JSON.stringify({username,password}),
            headers:{'Content-Type':'application/json'}
        })
        if(res.status===200){
            alert('Registration Successful!')
        }else{
            alert('Unsuccessful Registration. Try again later!!');
        }
    }

    return(
        <form className="register" onSubmit={register}>
            <h1>Register</h1>
            <input type="text" placeholder="UserName"
                    value={username}
                    onChange={event=>setUsername(event.target.value)}
            />
            <input type="password" placeholder="Password"
                    value={password}
                    onChange={event=>setPassword(event.target.value)}
            />
            <button type="submit">Register</button>
        </form>
    )
}