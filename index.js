import express from 'express'
import { UserRepository } from './model/db/SQL/usersModel.js';
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser';
import { SECRET_KEY_JWT } from './config.js';
import {TokenRepo} from './model/db/SQL/tokensModel.js'
import https from 'https'
import fs from 'fs'
import path from 'path';
const app = express();

const PORT = process.env.PORT ?? 3000

const __dirname = path.resolve(path.dirname(decodeURI(new URL(import.meta.url).pathname)));

const sslServer = https.createServer({
    key:fs.readFileSync(path.join(__dirname,'cert','key.pem')),
    cert:fs.readFileSync(path.join(__dirname,'cert','cert.pem'))
},app)


app.set('view engine','ejs')
app.use(express.json())
app.use(cookieParser())
app.use(async (req,res,next)=>{
    const refreshtoken = req.cookies.refresh_token
    let data = null
    if(req.path == '/logout'){
        return next()}
    if (refreshtoken===undefined){}
    else{
        data = jwt.verify(refreshtoken,SECRET_KEY_JWT)   
    }
    if (!data){
    }else{
         try { 
             const stored_token = await TokenRepo.getToken(data)
             if(stored_token.token===refreshtoken){
                 const newAccessToken = jwt.sign({id: data.id,username: data.username},SECRET_KEY_JWT,{
                    expiresIn:'10s'
                })
                req.cookies.access_token = newAccessToken
             next()
             }
         } catch (error) {
             console.log(error)
         }  
    }
    next()
})
app.use((req,res,next)=>{
    const accessToken = req.cookies.access_token
    let data = null

    req.session = {user:null}

    try {
        data = jwt.verify(accessToken,SECRET_KEY_JWT)
        req.session.user = data
    } catch (error) {
        req.session.user = null
    }
    next()
})

app.get('/',(req,res)=>{
    const {user} = req.session
    res.render('index',user)
})

app.post('/login', async (req,res)=>{
    const {username,password} = req.body

    try{
        const user = await UserRepository.login({username,password})
        const refreshToken = jwt.sign({id: user.id, username: user.username},SECRET_KEY_JWT,{
            expiresIn:'10d'
        })
        const accessToken = jwt.sign({id: user.id, username: user.username},SECRET_KEY_JWT,{
            expiresIn:'10s'
        })
        const tokenResult = await TokenRepo.destination(user,refreshToken)
        res
        .cookie('access_token',accessToken,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 10
        })
        res.cookie('refresh_token',refreshToken,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 10 
        })
        .send({ user, accessToken,refreshToken}) 

    } catch(error) {
        console.log(error)
        res.status(401).send(error.message)
    }

        
    
 
})
app.post('/register', async (req,res)=>{
    const {username,password} = req.body
    try{
        const id = await UserRepository.create({username,password})
        res.send({id}) 
    } catch(error) {
        res.status(400).send(error.message)
    }
})
app.post('/logout', (req,res)=>{
    res
    .clearCookie('access_token')
    .clearCookie('refresh_token')
    .send({message: 'Logout successful'})
})
app.get('/protected', (req,res)=>{
    const {user} = req.session
    if (!user) return res.status(403).send('Access not authorized')
    
    res.render('protected.ejs', user)

})

sslServer.listen(PORT, ()=>{console.log(`Secure connnection in ${PORT}`)})

