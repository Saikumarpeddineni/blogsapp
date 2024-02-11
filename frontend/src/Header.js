import {Link} from "react-router-dom";
import { useContext, useEffect} from "react";
import { UserContext } from "./UserContext";

export default function Header(){
  const {setUserInfo,userInfo} = useContext(UserContext);
  const token = localStorage.getItem('token');
  useEffect(()=>{
    fetch('https://myblogs-vzdk.onrender.com/profile',{
      method:'GET',
      credentials:'include',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    }).then(response=>{
      response.json().then(userInfo=>{
          setUserInfo(userInfo);
      });
    });
  },[setUserInfo]);

    function logout(){
      fetch('https://myblogs-vzdk.onrender.com/logout',{
        credentials:'include',
        method:'POST',
      }).then(() => {
        localStorage.removeItem('token');
        setUserInfo(null);
      });
      // setUserInfo(null);
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