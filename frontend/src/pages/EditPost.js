import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Editor from "../Editor";


export default function EditPost(){
    const {id} = useParams();
    const [title,setTitle] = useState('');
    const [summary,setSummary]=useState('');
    const [content,setContent] = useState('');
    const [files,setFiles] = useState('');
    const [redirect,setRedirect] = useState(false);

    useEffect(()=>{
        fetch("https://myblogs-vzdk.onrender.com/post/"+id)
            .then(response=>{
                response.json().then(postInfo=>{
                    setTitle(postInfo.title);
                    setContent(postInfo.content);
                    setSummary(postInfo.summary);
                })
            })
    },[]);

    async function updatePost(ev){
        ev.preventDefault();
        const data = new FormData();
        data.append('title',title);
        data.append('summary',summary);
        data.append('content',content);
        data.append('id',id);
        if(files?.[0]){
            data.set('file',files?.[0]);
        }
        const token = localStorage.getItem('token');
        const response= await fetch("https://myblogs-vzdk.onrender.com/post",{
            method:'PUT',
            body:data,
            credentials:'include',
            headers: {
                authorization: `Bearer ${token}`,
              }
        });
        if(response.ok){
            setRedirect(true);
        }
    }
    
    if(redirect){
        return <Navigate to={`/post/${id}`} />
    }
    
    return (
          <form onSubmit={updatePost}>
              <input type="title" placeholder={'Title'} value={title}
              onChange={ev=>setTitle(ev.target.value)}
              />
              <input type="summary" placeholder={'Summary'} value={summary}
              onChange={ev=>setSummary(ev.target.value)}
              />
              <input type="file" onChange={ev=>setFiles(ev.target.files)} />
              <Editor onChange={setContent} value={content} />
              <button style={{marginTop:'5px'}}>Update Post</button>
          </form>
      )
}