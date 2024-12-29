import express from 'express'
import { UserRepository } from './user-repository.js';
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser';

const app = express();

const PORT = process.env.PORT ?? 3000

app.set('view engine','ejs')
app.use(express.json())

app.get('/',(req,res)=>{
    res.render('index.ejs',{name: 'me'})
})

app.post('/login', async (req,res)=>{
    const {username,password} = req.body

    try{
        const user = await UserRepository.login({username,password})
        const token = jwt.sing({id: user._id, username: user.username},SECRET_KEY_JWT,{
            expiresIn:'1h'
        })
        res.send({ user, token}) 
    } catch(error) {
        res.status(401).send(error.message)
    }

})
app.post('/register', async (req,res)=>{
    const {username,password} = req.body
    console.log('dhweiufwiuv')
    try{
        const id = await UserRepository.create({username,password})
        res.send({id}) 
    } catch(error) {
        res.status(400).send(error.message)
    }
})
app.post('/logout', (req,res)=>{})
app.post('/protected', (req,res)=>{
    res.render('protected', {username: 'yo merengues'})

})



app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})