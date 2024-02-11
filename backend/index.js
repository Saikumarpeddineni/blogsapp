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

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : false, // Set to false during development
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    sameSite: "None",
    domain: 'blogsapp-zeta.vercel.app',
    path: '/',
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
    // const {token} = req.cookies;
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized - Token missing' });
      }
      const secret = "myblogsecret123";
      jwt.verify(token, secret, {}, (err, info) => {
        if (err) {
          console.error(err);
          return res.status(401).json({ error: 'Unauthorized' });
        }
    
        res.json(info);
      });
});

app.post('/logout',(req,res)=>{
    // res.clearCookie('token', cookieOptions).json({ message: 'Logout successful' });
    localStorage.removeItem('token');
    res.json({ message: 'Logout successful' });
});

app.post('/post',uploadMiddleware.single('file'),async (req,res)=>{
    const {originalname,path} = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length-1];
    const newPath = path+'.'+ext;
    fs.renameSync(path,newPath);

    const token = req.headers.authorization; // Assuming the token is sent in the Authorization header
    const secret = "myblogsecret123"; // Make sure to use the same secret as used during token creation

    if (!token) {
                return res.status(401).json({ error: 'Unauthorized - Token missing' });
            }

    // jwt.verify(token,secret,{},async (err,info)=>{
    //     if (!token) {
    //         return res.status(401).json({ error: 'Unauthorized - Token missing' });
    //     }
    //     if (err) {
    //         console.error(err);
    //         return res.status(401).json({ error: 'Unauthorized' });
    //     }
    //     const {title,summary,content}=req.body;
    //     const postDoc = await Post.create({
    //     title,summary,content,
    //     cover:newPath,
    //     author:info.id
    // });

    // res.json(postDoc);
    // console.log(res,".jgjukvh");
    // });

    // jwt.verify(token, secret, {}, async (err, info) => {
    //     if (err) {
    //       console.error(err);
    //       return res.status(401).json({ error: 'Unauthorized' });
    //     }
    
    //     const { title, summary, content } = req.body;
    //     const postDoc = await Post.create({
    //       title,
    //       summary,
    //       content,
    //       cover: newPath,
    //       author: info.id
    //     });
    
    //     res.json(postDoc);
    //   });
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

    const {token} = req.cookies;
    jwt.verify(token,secret,{},async (err,info)=>{
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
})


app.listen(4000);
//mongodb+srv://saikumarpeddineni18:TqhZPVGpuOiJMxXQ@cluster0.9gd5l2k.mongodb.net/?retryWrites=true&w=majority
