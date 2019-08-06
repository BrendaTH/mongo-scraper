var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");

module.exports = function (app) {

  // ****************************************
  // A GET route for loading the home page
  app.get("/", function (req, res) {
    res.render("index", {});
  });

  // ****************************************
  // A GET route for scraping the website
  app.get("/scrape", function (req, res) {
    console.log("entering scrape");
    // First, we grab the body of the html with axios
    var scrapedArticlesArray = []; // an array of all result objects
    var savedArticlesArray = [];    // an array of result objects that arent saved
    axios.get("http://www.huffingtonpost.com/").then(function (response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
      var count = 0;
      // Now, we grab it and go:
      $("div.card--twilight").each(function (i, element) {
        // Save an empty result object
        var result = {};

        // Add the text and href of every link, and save them as properties of the result object
        // bjt may or may not use the image and count
        result.count = ++count;
        result.img = $(this)
          .find(".js-card-image")
          .find(".card__image__src")
          .attr("src");
        result.link = $(this)
          // .find(".yr-card-headline")
          .find(".card__link")
          .attr("href");
        result.summary = $(this)
          .find(".card__description")
          .find(".card__link")
          .text();
        result.title = $(this)
          .find(".card__headline__text")
          .text();

        scrapedArticlesArray.push(result);
      });
      // TODO: bjt you need to filter out any already saved articles from this array
      db.Article.find({})
        .then(function (dbSavedArticle) {
          console.log("in then for scrape and filter on saved articles");
          // If we were able to successfully find Articles,
          dbSavedArticle.forEach(function (item, index) {
            for (var i = 0; i < scrapedArticlesArray.length; i++) {
              // bjt console.log(index + ": " + item.title);
              // returns 0 if equal - a falsey value
              var matchedOnZero = item.title.localeCompare(scrapedArticlesArray[i].title);
              if (matchedOnZero === 0) {
                // got a match remove from Scraped Article Array
                scrapedArticlesArray.splice(i, 1);
              }
            }
          });
          res.render("scrape", { news_items: scrapedArticlesArray });
        })
        .catch(function (err) {
          console.log("in articles error bjt ");
        });
    });
  });

  // ****************************************
  // A GET route for showing the saved articles
  app.get("/show", function (req, res) {
    // Grab every document in the Articles collection
    console.log("in show bjt ");
    db.Article.find({})
      .then(function (dbArticle) {
        console.log("in then for show");
        // If we were able to successfully find Articles, send them back to the client
        res.render("show", { news_items: dbArticle });
      })
      .catch(function (err) {
        console.log("in articles error bjt ");

        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // ****************************************
  // A GET route for showing the notes for an article
  app.get("/getNotes/:id", function (req, res) {
    // first fetch the article with the notes
    console.log(req.params.id);
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function (dbArticle) {
        console.log(dbArticle);
        // for each note id in the notes array fetch the note
        // dbArticle should have something like _id, notes, title, link, summary
        // notes are in an array
        db.Note.find({ _id: { $in: dbArticle.notes } })
          .then(function (dbNotes) {
            console.log("the notes for find notes are");
            console.log(dbNotes);
            res.json(dbNotes);
          })
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        console.log("error in get notes for an article")
        console.log(err);
        res.json(err);
      });
  });

  // ****************************************
  // A POST route for saving an article scraped 
  // and displayed on the website
  app.post("/saveArticle", function (req, res) {
    // Grab every document in the Articles collection
    console.log("in save articles bjt ");
    var savedArticle = req.body;

    db.Article.create({
      title: savedArticle.title,
      link: savedArticle.link,
      summary: savedArticle.summary
    }).then(function (result) {
      console.log(result);
      console.log("bjt in then for save article");
      // res.status(200).end("article saved");
      res.json(result);
    })
      .catch(function (err) {
        console.log(err);
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // ****************************************
  // A POST route for deleting all saved articles
  app.post("/deleteAllSavedArticles", function (req, res) {
    // Grab every document in the Articles collection
    console.log("in delete all saved articles bjt ");

    db.Article.deleteMany({})
      .then(function (result) {
        console.log("articles: " + result);
        // now remove all the notes too 
        db.Note.deleteMany({})
          .then(function (result) {
            console.log("notes: " + result);
            res.json(result);
          })
      })
      .catch(function (err) {
        console.log(err);
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // ****************************************
  // A POST route for deleting a saved note
  app.post("/deleteNote/:id", function (req, res) {
    // Grab every document in the Articles collection
    console.log("in delete an note bjt ");

    db.Note.findOneAndDelete({ _id: req.params.id })
      .then(function (dbNote) {
        console.log("result of deleting a note " + dbNote);
        // now delete the note in the article
        return db.Article.findOneAndUpdate({ _id: req.body.articleId }, { $pull: { notes: req.params.id } });
      })
      .then(function (refResult) {
        console.log("result fo deleting note from article " + refResult);
        res.status(200).end("id " + req.params.id + " note deleted");
      })
      .catch(function (err) {
        console.log("error in delete one note: " + err);
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // ****************************************
  // A POST route for deleting a saved articles
  app.post("/deleteArticle/:id", function (req, res) {
    // Grab every document in the Articles collection
    console.log("in delete an article bjt ");

    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      // .populate("note")
      .then(function (dbArticle) {
        // dbArticle should have something like _id, notes, title, link, summary
        // notes are in an array
        console.log("result of finding article: " + dbArticle);
        db.Note.deleteMany({ _id: { $in: dbArticle.notes } })
          .then(function (noteResult) {
            console.log("result of deleting notes: " + noteResult);

            // now delete the article
            db.Article.deleteOne({ _id: req.params.id })
              .then(function (articleDeleteResult) {
                console.log("result of deleting article: " + articleDeleteResult);
                res.status(200).end("id " + req.params.id + " deleted");
              })
          })
          .catch(function (err) {
            console.log("error in delete one article: " + err);
            // If an error occurred, send it to the client
            res.json(err);
          });
      });
  });

  // **********************************************
  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function (dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // **********************************************
  // Route for saving an Article's associated Note
  app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    console.log('in post for save note: ' + req.body.summary);
    var savedNote = req.body;

    db.Note.create({ body: savedNote.summary })
      .then(function (dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { notes: dbNote._id } }, { new: true });
      })
      .then(function (dbArticle) {
        console.log('in then for articles/id findone and update: ' + dbArticle);
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        console.log(err);
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // **********************************************
  // Render 404 page for any unmatched routes
  app.get("*", function (req, res) {
    res.render("404");
  });
};
