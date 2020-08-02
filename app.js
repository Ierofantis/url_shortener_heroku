require('dotenv').config();
var express = require('express');
var app = express();
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config');
var base58 = require('./base58.js');
// grab the url model
var Url = require('./models/url');

mongoose.connect(`mongodb://${process.env.USER}:${process.env.PASSWORD}@ds043971.mlab.com:43971/url_shortener`, { useMongoClient: true }, function (error) {

  if (error) console.error(error);
  else console.log("mongo connected")

});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get('/new/:longUrl(*)', function (req, res, next) {
  var longUrl = req.params.longUrl;

  // check if url already exists in database
  Url.findOne({ long_url: longUrl }, function (err, doc) {
    if (doc) {
      shortUrl = config.webhost + base58.encode(doc._id);
      // the document exists, so we return it without creating a new entry
      res.send({ 'shortUrl': shortUrl });

    } else {
      // since it doesn't exist, let's go ahead and create it:
      var newUrl = Url({
        long_url: longUrl
      });


      // save the new link
      newUrl.save(function (err) {
        if (err) {
          console.log(err);
        }
        shortUrl = config.webhost + base58.encode(newUrl._id);
        res.send({ 'shortUrl': shortUrl });

      });
    }
  });
});

app.get('/:encoded_id', function (req, res) {

  var base58Id = req.params.encoded_id;

  var id = base58.decode(base58Id);

  // check if url already exists in database
  Url.findOne({ _id: id }, function (err, doc) {
    if (err) throw err;

    if (doc) {
      console.log("found doc", doc);
      res.redirect(doc.long_url)
    } else {
      console.log("no doc found");
      res.redirect(config.webhost);
    }
  });
});
const port = process.env.PORT || '8080';

app.set("port", port);
app.listen(port, () => console.log(`Server running on port ${port}`));
