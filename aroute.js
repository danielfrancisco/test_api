const express = require('express')
const { query } = require('express-validator');
const router = express.Router()

router.get('/route', query('name').escape(),(req, res)=>{
    // let ms = '<script>console.log("world")</script>'
    let name = req.query.name
    
    res.send(`hello ${name}`)
})

module.exports = router