const express = require("express");
const bodyParser = require("body-parser");
// const ejs = require("ejs");
const lodash = require("lodash");
const mysql = require("mysql2");
const cors = require('cors');

const app = express();

// app.set('view engine', 'ejs');
app.use(cors());

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

var con = mysql.createConnection({
  host: "35.188.105.245",
  user: "nddp-095",
  password: "apples",
  database: "youtube_trending_data"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

//con.query('SELECT * FROM category LIMIT 20', (error, results, fields) => {
//  if(error) throw error;
//  console.log(results)
//});

app.get("/", function(req, res){
  res.send({title: 'YouTube Trending Data'})
  console.log("asd");
});

app.listen(3000, "0.0.0.0", function(){
  console.log("server started on port 3000");
});