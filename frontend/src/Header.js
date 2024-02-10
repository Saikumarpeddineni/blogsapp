import {Link} from "react-router-dom";
import { useContext, useEffect} from "react";
import { UserContext } from "./UserContext";

export default function Header(){
  const {setUserInfo,userInfo} = useContext(UserContext)
  useEffect(()=>{
    fetch('https://myblogs-vzdk.onrender.com/profile',{
      credentials:'include',
    }).then(response=>{
      response.json().then(userInfo=>{
          setUserInfo(userInfo);
      });
    });
  },[]);

    function logout(){
      fetch('https://myblogs-vzdk.onrender.com/logout',{
        credentials:'include',
        method:'POST',
      })
      setUserInfo(null);
    }

    const username = userInfo?.username;

    return(
        <header>
          <Link to="/" className="logo">MyBlogs</Link>
        <nav>
          {username&&(
            <>
              <span>Hello, {username}</span>
              <Link to="/create">Create New Post</Link>
              <a onClick={logout} href="">Logout</a>
            </>
          )}
          {!username&&(
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>
    );
}