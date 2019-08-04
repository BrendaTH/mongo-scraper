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

        // console.log("title: " + result.title);
        // console.log("link: " + result.link);
        // console.log("summary: " + result.summary);
        // save this article into the scraped articles array
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
                scrapedArticlesArray.splice(i,1);
              }
            }
          });
          res.render("scrape", { news_items: scrapedArticlesArray });
        })
        .catch(function (err) {
          console.log("in articles error bjt ");
        });


      /*
            db.Article.find({})
              .then(function (dbDoc) {
                console.log("in then for scrape " + JSON.stringify(dbDoc));
                if (!dbDoc) {
                  console.log("pushing resutl to articles array");
                  // this title not found in saved 
                  // so push it onto the scraped pile
                  articlesArray.push(allArticlesArray[i]);
                }
                // if this is the last article render the scraped page
                // minus any saved articles
                console.log("index is " + i);
                if (i >= allArticlesArray.length - 1) {
                  console.log("rendering scrape page");
                  res.render("scrape", { news_items: articlesArray });
                }
              })
              .catch(function (err) {
                console.log(err);
                // If an error occurred, send it to the client
                res.json(err);
              });
      */
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

    db.Article.remove({})
      .then(function (result) {
        console.log(result);
        res.json(result);

      })
      .catch(function (err) {
        console.log(err);
        // If an error occurred, send it to the client
        res.json(err);
      });

  });

  // ****************************************
  // A POST route for deleting a saved articles
  app.post("/deleteArticle/:id", function (req, res) {
    // Grab every document in the Articles collection
    console.log("in delete an article bjt ");

    db.Article.remove({ _id: req.params.id })
      .then(function (result) {
        console.log("bjt in then for delete article");
        res.status(200).end("id " + req.params.id + " deleted");
      })
      .catch(function (err) {
        console.log(err);
        // If an error occurred, send it to the client
        res.json(err);
      });

  });

  // Route for getting all saved Articles from the db
  app.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    console.log("in articles bjt ");
    db.Article.find({})
      .then(function (dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        console.log("in articles error bjt ");

        // If an error occurred, send it to the client
        res.json(err);
      });
  });

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

  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function (dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function (dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // **********************************************


  /*
    // load by category
    app.get("/category/:category", function (req, res) {
      res.json("category: " + req.params.category);
      // db.Place.findall({ where: { category: req.params.category } }).then(function(result) {
      //   res.render("search", {
      //     example: result
      //   });
      // });
    });
  
    // load by username
    app.get("/user/:id", function (req, res) {
      res.json("username: " + req.params.username);
      // db.User.findOne({ where: { id: req.params.id } }).then(function(resuolt) {
      //   res.render("search", {
      //     example: result
      //   });
      // });
    });
    */

  // Render 404 page for any unmatched routes
  app.get("*", function (req, res) {
    res.render("404");
  });
  /*
    // create place
    app.post("/place", function (req, res) {
      var place = req.body;
  
      db.Place.create({
        category: place.category,
        place_name: place.place_name,
        street_address: place.street_address,
        city: place.city,
        jurisdiction: place.jurisdiction,
        zip_code: place.zip_code,
        phone_number: place.phone_number,
        summary: place.summary,
        services: place.services,
        external_link: place.external_link
      }).then(function (result) {
        res.redirect('/search');
      })
        .catch(function (err) {
          console.log(err);
        });
    });
  
    // create review
    app.post("/review", function (req, res) {
      var review = req.body;
  
      db.Review.create({
        rating: review.rating,
        comments: review.comments,
        PlaceId: review.PlaceId,
        UserId: review.UserId
      }).then(function (result) {
        res.redirect('back');
      })
        .catch(function (err) {
          console.log(err);
        });
    });
  
    // create user
    app.post("/user", function (req, res) {
      // these are possible responses to return to the front end
      var dupResponse = "duplicate email";  // email is already in the database for a different use
      var okResponse = "ok";                // user created successfully
      var alreadyRegResponse = "already registered"; // user already in database
      // determine if user already exists:
      db.User.count({
        where: {
          user_name: req.body.username,
          email_address: req.body.email,
        }
      }).then(count => {
        // if count is zero then this one is new.
        // if it alredy exists then no need to do anything more to db
        if (count === 0) {
          db.User.create({
            user_name: req.body.username,
            email_address: req.body.email,
          }).then(function (dbUserCreateResult) {
            res.status(200).end(dbUserCreateResult.dataValues.id.toString());
          })
            .catch(function (err) {
              // Whenever a validation or flag fails, an error is thrown
              // We can "catch" the error to prevent it from being "thrown", which could crash our node app
              // this probably means someone is re-using an aleady existing email address
              // email address is unique in the User table so this will throw an error
              console.log(`
              Error in post for User db:
              Error Name: ${err.name}
              Error Code: ${err.parent.code}
              Error SQL Message: ${err.parent.sqlMessage}
              failed to add new User
              `);
              res.status(200).end(dupResponse);
            });
        } else {
          // User already exists just respond with ok
          db.User.findOne({
            where: {
              user_name: req.body.username,
              email_address: req.body.email,
            }
          }).then(function (userResult) {
            res.status(200).end(userResult.dataValues.id.toString());
          });
        }
      })
    });
  
    // delete place
    app.delete("/place/:id", function (req, res) {
      db.Place.destroy({
        where: {
          id: req.params.id
        }
      }).then(function (result) {
        if (result.affectedRows == 0) {
          return res.status(404).end();
        } else {
          res.status(200).end();
        }
      })
    });
  
    // delete review
    app.delete("/review/:id", function (req, res) {
      // db.Review.destroy({
      //   where: {
      //     id: req.params.id
      //   }
      // }).then(function (result) {
      //   res.json(result);
      // })
    });
  
    // delete user
    app.delete("/user/:id", function (req, res) {
      // db.User.destroy({
      //   where: {
      //     id: req.params.id
      //   }
      // }).then(function (result) {
      //   res.json(result);
      // })
    });
    */
};
