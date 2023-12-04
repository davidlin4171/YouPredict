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
app.use(express.json());

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

function generateRandomId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 11; i++) {
      id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return id;
}

function getCurrentDateTime() {
  const now = new Date();

  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
}

function getCountryCode(countryName) {
  if (countryName == 'brazil')
    return 1;
  else if (countryName = 'canada')
    return 2;
  else if (countryName = 'india')
    return 3;
  else if (countryName = 'japan')
    return 4;
  else if (countryName = 'us')
    return 5;
  return 6;
}

app.post("/crud/create", (req, res) => {
  const channelTitle = req.body.channelId;
  const videoTitle = req.body.videoTitle;
  const categoryId = req.body.categoryId;
  const tags = req.body.tags;
  const description = req.body.description;
  const countryName = req.body.countryName;
  
  let channelId = 'UC0uRT_armQXqds_rjTjqJ23';
  let videoId = generateRandomId();
  let currentDateTime = getCurrentDateTime();
  let view_count = 0;
  let likes = 0;
  let dislikes = 0;
  let comment_count = 0;
  let thumbnail_link = null;
  let comments_disabled = false;
  let ratings_disabled = false;
  let countryCode = getCountryCode(countryName);

  let query = `INSERT INTO channel(${})
  `;
});


app.listen(3000, "0.0.0.0", function(){
  console.log("server started on port 3000");
});