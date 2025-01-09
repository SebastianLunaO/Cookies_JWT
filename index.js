import express from 'express'
import { UserRepository } from './user-repository.js';
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser';
import { SECRET_KEY_JWT } from './config.js';
import {TokenRepo} from './user-repository.js'

const app = express();

const PORT = process.env.PORT ?? 3000

app.set('view engine','ejs')
app.use(express.json())
app.use(cookieParser())
app.use((req,res,next)=>{/*console.log('request New access Token using refresh token');*/ next()})
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
        console.log(tokenResult)
        res
        .cookie('access_token',accessToken,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'prodcution',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 10
        })
        res.cookie('refresh_token',refreshToken,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'prodcution',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 10 
        })
        .send({ user, accessToken,refreshToken}) 

    } catch(error) {
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
    .send({message: 'Logout successful'})
})
app.get('/protected', (req,res)=>{
    const {user} = req.session
    if (!user) return res.status(403).send('Access not authorized')
    
    res.render('protected.ejs', user)

})



app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})