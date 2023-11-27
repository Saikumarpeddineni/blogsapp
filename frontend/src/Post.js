import {formatISO9075} from "date-fns";
import { Link } from "react-router-dom";

export default function Post({_id,title,summary,content,cover,createdAt,author}){
    return(
        <div className="post">
          <div className="blog-img">
            <Link to={`/post/${_id}`}>
              <img src={"https://myblogs-vzdk.onrender.com/"+cover} alt="post-img"/> 
            </Link>
          </div>
          <div className="blog-details">
            <Link to={`/post/${_id}`}>
              <h2>{title}</h2>
            </Link>
            <p className="info">
              <a className="author">{author.username}</a>
              <time>{formatISO9075(new Date(createdAt))}</time>
            </p>
            <p  className="summary">{summary}</p>
          </div>
      </div>
    )
}