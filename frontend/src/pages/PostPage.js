import { formatISO9075 } from "date-fns";
import { useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import {UserContext} from "../UserContext";
import { Link } from "react-router-dom";
import { Navigate } from "react-router-dom";

export default function PostPage(){
    const [postInfo,setPostInfo] = useState(null);
    const {userInfo} = useContext(UserContext);
    const [redirect, setRedirect] = useState(false);
    const {id} = useParams();
    useEffect(()=>{
        fetch(`https://myblogs-vzdk.onrender.com/post/${id}`)
            .then(response => {
                response.json().then(postInfo=>{
                    setPostInfo(postInfo);
                })
            })
    },[]);

    function deletePost(id) {
        fetch(`https://myblogs-vzdk.onrender.com/delete/${id}`, {
          method: 'DELETE',
        })
          .then(response => {
            if (response.ok) {
              alert('Blog Deleted');
              setRedirect(true);
            } else {
              // Handle non-successful response (e.g., show an error message)
              console.error('Failed to delete blog:', response.statusText);
              // Optionally, you can throw an error or handle it in a different way
              throw new Error(`Failed to delete blog: ${response.statusText}`);
            }
          })
          .catch(error => {
            // Handle network errors or other errors during the fetch operation
            console.error('Error deleting blog:', error.message);
            // Optionally, you can show an error message to the user
            alert('Failed to delete blog. Please try again.');
          });
      }
      
      if (redirect) {
        return <Navigate to={'/'} />;
      }

    if(!postInfo) return '';

    return(
        <div className="post-page">
            <h1>{postInfo.title}</h1>
            <time>{formatISO9075(new Date(postInfo.createdAt))}</time>
            <div className="author">by @{postInfo.author.username}</div>
            {userInfo.id===postInfo.author._id && (
                <div className="buttons-container">
                    <div className="edit-row">
                    <Link className="edit-btn" to={`/edit/${postInfo._id}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
</svg>
 Edit Blog
                    </Link>
                </div>
                <div>
                <button className="delete-btn" onClick={() => deletePost(postInfo._id)}>
                Delete Blog
                </button>
                </div>
                </div>
            )}
            <div className="image">
                <img src={`https://myblogs-vzdk.onrender.com/${postInfo.cover}`} alt="blog-img" />
            </div>
            <div className="content" dangerouslySetInnerHTML={{__html:postInfo.content}}/>
        </div>
    )
}