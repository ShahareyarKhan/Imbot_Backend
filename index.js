const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./db');
const cors = require('cors'); // frontend can access backend

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

connectDB();

app.get('/', (req, res) => {
  res.send('Backend working properly.');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/pdf', require('./routes/pdfhandle'));

app.listen(3000,()=>{
  console.log("Backend Working.");
})