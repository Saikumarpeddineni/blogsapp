const express = require('express');
const app = express();
const mongoose=require('mongoose');
const User = require('./Models/User');
const Post = require('./Models/Post')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const multer = require('multer');
const uploadMiddleware = multer({dest:'uploads/'});
const fs = require('fs');
const { userInfo } = require('os');

const corsOptions = {
    credentials: true,
    origin: ['https://blogsapp-zeta.vercel.app', 'http://blogsapp-zeta.vercel.app'],
    optionsSuccessStatus: 200,
  };


app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname+"/uploads"));

const salt = bcrypt.genSaltSync(10);
const secret = "myblogsecret123";

mongoose.connect('mongodb+srv://saikumarpeddineni18:TqhZPVGpuOiJMxXQ@cluster0.9gd5l2k.mongodb.net/?retryWrites=true&w=majority')

app.post('/register',async (req,res)=>{
    const {username,password}=req.body;
    try{
        const UserDoc=await User.create({username,password:bcrypt.hashSync(password,salt)});
        res.json(UserDoc);
    }catch(e){
        res.status(400).json(e);
    }
})

app.post('/login',async (req,res)=>{
    try{
        const {username,password}=req.body;
    const userDoc = await User.findOne({username});
    const passOk= bcrypt.compareSync(password,userDoc.password);
    if(passOk){
        jwt.sign({username,id:userDoc._id},secret,{},(err,token)=>{
            if(err) res.status(400).json(err);
            else{
                console.log("Setting cookie:", token);
                res.json({
                    id:userDoc._id,
                    username,
                    token
                });
            }
        });
    }else{
        res.status(400).json('wrong credentials');
    }
    }catch(e){
        res.status(400).json('wrong crdentials');
    }
});

app.get('/profile',(req,res)=>{
    const token = req.headers.authorization;
    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
      }
      
    const actualToken = token.split(' ')[1];
    if (!actualToken) {
        return res.status(401).json({ error: 'Unauthorized - Token missing' });
      }
      const secret = "myblogsecret123";
      jwt.verify(actualToken, secret, {}, (err, info) => {
        if (err) {
          console.error(err);
          return res.status(401).json({ error: 'Unauthorized' });
        }
    
        res.json(info);
      });
});

app.post('/logout',(req,res)=>{
    res.json({ message: 'Logout successful' });
});

app.post('/post',uploadMiddleware.single('file'),async (req,res)=>{
    const {originalname,path} = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length-1];
    const newPath = path+'.'+ext;
    fs.renameSync(path,newPath);

    const token = req.headers.authorization; // Assuming the token is sent in the Authorization header
    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
      }
      
    const actualToken = token.split(' ')[1];
    const secret = "myblogsecret123"; // Make sure to use the same secret as used during token creation

    if (!actualToken) {
                return res.status(401).json({ error: 'Unauthorized - Token missing' });
            }

    jwt.verify(actualToken, secret, {}, async (err, info) => {
        if (err) {
          console.error(err);
          return res.status(401).json({ error: 'Unauthorized' });
        }
    
        const { title, summary, content } = req.body;
        const postDoc = await Post.create({
          title,
          summary,
          content,
          cover: newPath,
          author: info.id
        });
    
        res.json(postDoc);
      });
    
});

app.get('/post',async (req,res)=>{
    res.json(
        await Post.find()
        .populate('author',['username'])
        .sort({createdAt:-1})
        .limit(20)
    );
});

app.get("/post/:id",async (req,res)=>{
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author',['username']);
    res.json(postDoc);
});

app.put("/post",uploadMiddleware.single('file'),async (req,res)=>{
    let newPath = null; 
    if(req.file){
        const {originalname,path} = req.file;
        const parts = originalname.split(".");
        const ext = parts[parts.length-1];
        newPath = path+'.'+ext;
        fs.renameSync(path,newPath);
    }

    const token = req.headers.authorization; // Assuming the token is sent in the Authorization header
    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
      }
      
    const actualToken = token.split(' ')[1];
    const secret = "myblogsecret123"; // Make sure to use the same secret as used during token creation

    if (!actualToken) {
                return res.status(401).json({ error: 'Unauthorized - Token missing' });
            }
    jwt.verify(actualToken,secret,{},async (err,info)=>{
        if (err) {
            console.error(err);
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const {id,title,summary,content}=req.body;
        const postDoc = await Post.findById(id);
        const isAuthor = JSON.stringify(postDoc.author)===JSON.stringify(info.id);
        if(!isAuthor){
            res.json(400).json('you are not the author');
        } 
        await postDoc.updateOne({title,summary,content,cover:newPath?newPath:postDoc.cover});
        res.json(postDoc);
    })
});

app.delete("/delete/:id",async (req,res)=>{
    const { id } = req.params;

    try {
        // Use Mongoose to find and remove the post by id
        const deletedPost = await Post.findByIdAndRemove(id);

        if (deletedPost) {
            res.json({ success: true, deletedPost });
        } else {
            // If post with the given id is not found
            res.status(404).json({ success: false, message: 'Post not found' });
        }
    } catch (error) {
        // Handle any errors that may occur during the operation
        console.error('Error deleting post:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }  
})


app.listen(4000);
//mongodb+srv://saikumarpeddineni18:TqhZPVGpuOiJMxXQ@cluster0.9gd5l2k.mongodb.net/?retryWrites=true&w=majority
