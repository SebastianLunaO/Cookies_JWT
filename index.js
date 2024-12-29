import express from 'express'

const app = express();

const PORT = process.env.PORT ?? 3000

app.get('/',(req,res)=>{
    res.send('hello world!!!!');
})

app.post('/login', (req,res)=>{})
app.post('/register', (req,res)=>{})
app.post('/logout', (req,res)=>{})
app.post('/protected', (req,res)=>{})



app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})