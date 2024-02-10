import { useEffect, useState } from "react"
import Post from "../Post"

export default function Indexpage(){
    const [posts,setPosts]= useState([]);
    useEffect(()=>{
        fetch('https://myblogs-vzdk.onrender.com/post').then(res=>{
            res.json().then(posts=>{
                setPosts(posts);
            })
        })
    },[]);
    return(
        <>
            {posts.length>0 && posts.map(post=>
                <Post key={post.id} {...post} />    
            )}
        </>
    )
}