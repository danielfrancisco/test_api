const express = require('express')
const port = 3000
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('express-validator');
const aroute = require('./aroute');

app.use(cors())
app.use(express.json());

const users = []

app.post('/register',async(req, res)=>{
    const {username, password} = req.body;

    if(!username || !password){
        return res.status(400).json({message:'username and password required'})
    }

    const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
  }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: Date.now(),
      username,
      password: hashedPassword
    };
    users.push(newUser);
  
    res.status(201).json({ message: 'User created successfully' });
})

app.use('/', aroute)

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    // Find user
    const user = users.find(user => user.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  
    const token = jwt.sign({ userId: user.id }, 'se', { expiresIn: '1h' });
    
    res.json({ token });
  });

  function authenticateToken(req, res, next) {
    
    const token = req.headers['token'];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, 'sec', (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  }

  function userAccesControl(req,res, next){
      const role = req.user.userID.userRole;
      if(role!=='dev'){
        return res.sendStatus(403)
      }
      next();
  }

  app.get('/protected', authenticateToken, userAccesControl, (req, res) => {
      res.send({ message: 'Protected content' });
  });

  app.get('/getToken', (req,res)=>{
    const token = jwt.sign({ userID: {name:'Ben', userRole:'dev'} }, 'sec', { expiresIn: '1h' });
    res.send({token:token})
  })

  app.get('/test', (req, res)=>{
    res.send({data: 'hello world'})
  })
  

app.listen(port,()=>{
    console.log(`server running on port ${port}`)
})