const express = require('express') ;
const app = express() ;

app.get('/' , (req , res) => {
    res.send('Hello oussama with express !!') ;
})

app.listen(3000 , () => {
    console.log('page index') ;
})