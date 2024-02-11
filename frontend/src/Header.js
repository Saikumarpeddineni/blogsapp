import { Link } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { UserContext } from './UserContext';

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      fetch('https://myblogs-vzdk.onrender.com/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch profile: ${response.statusText}`);
          }
          return response.json();
        })
        .then((userInfo) => {
          setUserInfo(userInfo);
        })
        .catch((error) => {
          console.error('Error fetching profile:', error.message);
        });
    }
  }, [setUserInfo]);

  function logout() {
    fetch('https://myblogs-vzdk.onrender.com/logout', {
      credentials: 'include',
      method: 'POST',
    }).then(() => {
      localStorage.removeItem('token');
      setUserInfo(null);
    });
  }

  const username = userInfo?.username;

  return (
    <header>
      <Link to="/" className="logo">
        MyBlogs
      </Link>
      <nav>
        {username && (
          <>
            <span>Hello, {username}</span>
            <Link to="/create">Create New Post</Link>
            <a onClick={logout} href="">
              Logout
            </a>
          </>
        )}
        {!username && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
