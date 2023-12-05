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
});

app.post("/submit-data", function(req, res) {
  country = req.body.country;
  channel = req.body.channelName;
  tags = req.body.tags;
  console.log(country);
  console.log(channel);
  console.log(tags);
//Show Title, PublishedAt, channelTitle, categoryID, treding_date, tags, view_count, likes, comment_count, description,
  con.query(`SELECT v.video_id, v.publishedAt, v.title, v.description, ca.categoryId, ca.tags,ch.channel_title, vs.trending_date, vs.view_count, vs.likes, vs.comment_count, cs.avgLikes, cs.avgViews, cs.avgComments
  FROM video AS v
  JOIN category AS ca ON v.video_id = ca.video_id
  JOIN channel AS ch ON v.channel_id = ch.channel_id
  JOIN video_stats AS vs ON v.video_id = vs.video_id
  JOIN ChannelStatistics AS cs ON v.channel_id = cs.channel_id
  WHERE v.country = ? AND ch.channel_title LIKE ? AND ca.tags LIKE ?;`, [country, '%'+channel+'%', '%'+tags+'%'], (err, results, fields) => {
    if (err) throw err;
    console.log(results);
    res.json(results);
  });
});

// Inserts a video and all its information into the corresponding sql tables
app.post("/crud/create", (req, res) => {
  console.log("askjdas");
  const channelTitle = req.body.channelTitle;
  const videoTitle = req.body.videoTitle;
  const categoryId = req.body.categoryId;
  const tags = req.body.tags;
  const description = req.body.description;
  const countryName = req.body.countryName;
  
  let channelId = generateRandomId();
  let videoId = generateRandomId();
  let currentDate = getCurrentDateTime();
  let view_count = 0;
  let likes = 0;
  let dislikes = 0;
  let comment_count = 0;
  let thumbnail_link ='';
  let comments_disabled = false;
  let ratings_disabled = false;

  let insert_channel = `INSERT INTO channel(channel_id, channel_title) VALUES (?, ?);`;
  let insert_video = `INSERT INTO video(video_id, channel_id, publishedAt, title, thumbnail_link, description, country) VALUES (?, ?, ?, ?, ?, ?, ?);`;
  let insert_video_stats = `INSERT INTO video_stats(trending_date, video_id, view_count, likes, dislikes, comment_count, comments_disabled, ratings_disabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
  let insert_category = `INSERT INTO category(categoryId, video_id, tags) VALUES(?, ?, ?);`;
  
  con.query(insert_channel, [channelId, channelTitle], (error, results, fields) => {
     if(error) console.log("channelId already exists");

  });
  //find channelID in case title exists
  let find_channelId = `SELECT channel_id FROM channel WHERE channel_title = ?`
  con.query(find_channelId, channelTitle, (error, results, fields) => {
    if (error) throw error;

    let updated_channelId = results[0].channel_id;

    con.query(insert_video, [videoId, updated_channelId, currentDate, videoTitle, thumbnail_link, description, countryName], (error, results, fields) => {
      //console.log(channelId)
      if(error) throw error;
    });
    con.query(insert_video_stats, [currentDate, videoId, view_count, likes, dislikes, comment_count, comments_disabled, ratings_disabled], (error, results, fields) => {
      if(error) throw error;
    });
    con.query(insert_category, [categoryId, videoId, tags], (error, results, fields) => {
      if(error) throw error;
    });
  });
  let storedProcedure = `call CalculateChannelStatistics`;
  con.query(storedProcedure, (error, results, fields) => {
    if (error) throw error;
  });
});

// Delete video by videoId
app.post("/crud/delete", (req, res) => {
  const videoId = req.body.videoId;
  let delete_query = `DELETE FROM video WHERE video_id = ?;`;
  con.query(delete_query, videoId, (error, results, fields) => {
    if(error) throw error;
  });
});

// Update video by whatever category
app.post("/crud/update", (req, res) => {
  const videoId = req.body.videoId;
  if (!videoId) {
    videoId = 'asjkdnfjasdbfjsabfdafbasdfb';
  }
  const title = req.body.title;
  const publishedAt = req.body.publishedAt;
  const cateogryId = req.body.categoryId;
  const trendingDate = req.body.trendingDate;
  const tags = req.body.tags;
  const viewCount = req.body.viewCount;
  const likes = req.body.likes;
  const dislikes = req.body.dislikes;
  const commentCount = req.body.commentCount;
  const thumbnailLink = req.body.thumbnailLink;
  const commentsDisabled = req.body.commentsDisabled;
  const ratingsDisabled = req.body.ratingsDisabled;
  const description = req.body.description;
  const countryName = req.body.countryName;
  let countryCode = getCountryCode();

  updateVideo(videoId, title, publishedAt, thumbnailLink, description, countryName);
  updateVideoStats(trendingDate, videoId, viewCount, likes, dislikes, commentCount, commentsDisabled, ratingsDisabled);
  updateCategory(cateogryId, videoId, tags);
  let storedProcedure = `call CalculateChannelStatistics`;
  con.query(storedProcedure, (error, results, fields) => {
    if (error) throw error;
  });
});

app.post('/advance-1', (req,res) => {
  const country = req.body.country;
  console.log(country);
  console.log("asdjksa");
})

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

function updateVideo(video_id, title, publishedAt, thumbnail_link, description, countryName) {
  let update_video = 'UPDATE video SET ';
  const videoParam = [];
  let videoParts = [];

  if (title) {
    videoParts.push("title = ? ");
    videoParam.push(title);
  }
  if (publishedAt) {
    videoParts.push("publishedAt = ? ");
    videoParam.push(publishedAt);
  }
  if (thumbnail_link) {
    videoParts.push("thumbnail_link = ? ");
    videoParam.push(thumbnail_link);
  }
  if (description) {
    videoParts.push("description = ? ");
    videoParam.push(description);
  }
  if (countryName) {
    videoParts.push("country = ? ");
    videoParam.push(countryName);
  }

  update_video+=videoParts.join(',');
  update_video+=" WHERE video_id = ?;";

  if (videoParam.length == 0) {
    return; //dont run query if there are no parms to be updated
  }

  videoParam.push(video_id);

  con.query(update_video, videoParam, (error, results, fields) => {
    if (error) throw error;
  });
}

function updateVideoStats(trending_date, video_id, view_count, likes, dislikes, comment_count, comments_disabled, ratings_disabled) {
  let update_video = 'UPDATE video_stats SET ';
  const videoParam = [];
  let videoParts = [];

  if (trending_date) {
    videoParts.push("trending_date = ? ");
    videoParam.push(trending_date);
  }
  if (view_count) {
    videoParts.push("view_count = ? ");
    videoParam.push(view_count);
  }
  if (likes) {
    videoParts.push("likes = ? ");
    videoParam.push(likes);
  }
  if (dislikes) {
    videoParts.push("dislikes = ? ");
    videoParam.push(dislikes);
  }
  if (comment_count) {
    videoParts.push("comment_count = ? ");
    videoParam.push(comment_count);
  }
  if (comments_disabled && (comments_disabled == 0 || comments_disabled == 1)) {
    videoParts.push("comments_disabled = ? ");
    videoParam.push(comments_disabled);
  }
  if (ratings_disabled && (ratings_disabled == 0 || ratings_disabled == 1)) {
    videoParts.push("ratings_disabled = ? ");
    videoParam.push(ratings_disabled);
  }

  update_video+=videoParts.join(',');
  update_video+=" WHERE video_id = ?;";
  if (videoParam.length == 0) {
    return; //dont run query if no params to be updated
  }
  videoParam.push(video_id);

  con.query(update_video, videoParam, (error, results, fields) => {
    if (error) throw error;
  });
}

function updateCategory(categoryId, video_id, tags) {
  let update_video = 'UPDATE category SET ';
  const videoParam = [];
  let videoParts = [];
  console.log(categoryId);

  if (categoryId) {
    videoParts.push("categoryId = ? ");
    videoParam.push(categoryId);
  }
  if (tags) {
    videoParts.push("tags = ? ");
    videoParam.push(tags);
  }

  update_video+=videoParts.join(',');
  update_video+=" WHERE video_id = ?;";

  if (videoParts.length == 0) {
    return; //dont run query if there are no parms to be updated
  }

  videoParam.push(video_id);

  con.query(update_video, videoParam, (error, results, fields) => {
    if (error) throw error;
  });
}

app.listen(3000, "0.0.0.0", function(){
  console.log("server started on port 3000");
});