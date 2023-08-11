const express = require('express');
const bodyParser = require('body-parser');
const cors = require ('cors')
const { usersRouter } = require('./routes/usersRouter');




const app = express();

app.use(bodyParser.urlencoded({extended: true }))
app.use(express.json())
app.use(cors())
app.use('/users',usersRouter)

app.use((err,req,res,next)=>{
    res.json({Error: err})
})


app.listen(4500,()=>{
    console.log('server running on port 4500')
})