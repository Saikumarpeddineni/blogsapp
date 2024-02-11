import { useState } from "react";
import {Navigate} from "react-router-dom"
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import Editor from "../Editor";


export default function CreatePost(){
    const [title,setTitle] = useState('');
    const [summary,setSummary]=useState('');
    const [content,setContent] = useState('');
    const [files,setFiles] = useState('');
    const [redirect,setRedirect] = useState(false);

    async function createNewPost(ev){
      ev.preventDefault();

      const data = new FormData();
      data.append('title',title);
      data.append('summary',summary);
      data.append('content',content);
      data.append('file',files[0]);
      
      const token = localStorage.getItem('token');
      const response = await fetch('https://myblogs-vzdk.onrender.com/post',{
        method:"POST",
        body:data,
        credentials:'include',
        headers: {
          // Include the token in the Authorization header
          Authorization: `Bearer ${token}`
        }
      })
      console.log(response);
      if(response.ok){
          setRedirect(true);
      }
    }

    if(redirect){
      return <Navigate to={'/'} />
    }
    
    return (
        <form onSubmit={createNewPost}>
            <input type="title" placeholder={'Title'} value={title}
            onChange={ev=>setTitle(ev.target.value)}
            />
            <input type="summary" placeholder={'Summary'} value={summary}
            onChange={ev=>setSummary(ev.target.value)}
            />
            <input type="file" onChange={ev=>setFiles(ev.target.files)} />
            <Editor value={content} onChange={setContent}/>
            <button style={{marginTop:'5px'}}>Create Post</button>
        </form>
    )
}