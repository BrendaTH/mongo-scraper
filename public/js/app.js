// run this code when we load the page
$(function () {
  console.log("in js on fe");
  // Grab the articles as a json
  /*
  $.getJSON("/articles", function (data) {
    // For each one
    event.preventDefault();
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    }
    return false;
  });
  */
  /**
   * On-Click event save article to database 
   * and remove from scraped page
   */
  $(".save-article-btn").on("click", function () {
    console.log('in save-article-btn click');
    var title = $(this).attr("data-t");
    var link = $(this).attr("data-l");
    var summary = $(this).attr("data-s");
    $.ajax({
      type: "POST",
      url: "/saveArticle",
      dataType: "json",
      data: {
        title,
        link,
        summary
      }
    })
      .then(function (data) {
        console.log("in then for save article");
        console.log(status);
        location.reload();
      });
    return false;
  });

  /**
   * On-Click event delete all saved articles in database 
   */
  $("#clear-btn").on("click", function (event) {
    $.ajax({
      type: "POST",
      url: "/deleteAllSavedArticles",
    })
      .then(function (data) {
        console.log(data);
        console.log("in then for delete all saved articles");
        location.reload();
      });
    return false;
  });

  

  $(".add-note-btn").on("click", function () {
    console.log('in add-note-btn click');
    event.preventDefault();
    // add the id for this article
    var p = $("<p>").text("Id: " + $(this).data('id'));
    $("#noteId").append(p);
    // cause modal to pop up
    $("#add-note-modal").modal();
    location.reload();

  });

      /**
     * On-Click event to submit the new note
     * to the database
     */
    $("#place-submit").on("click", function (event) {
      event.preventDefault(); 
      var articleId = $("#noteId").text().substring(3);
      console.log("id is " + articleId);
    
      var newNote = {
          id: articleId,
          summary: $("#note-summary").val().trim(),
      };

      // Send the Post request to village_db Places Table
      $.ajax("/note", {
          type: "POST",
          data: newNote
      }).then(
          function () {
              console.log("created new note");
              // Reload the saved  to get the updated list
              location.reload();
          }
      )
  });

  /**
   * On-Click event delete single article from database 
   */
  $(".delete-article-btn").on("click", function () {
    console.log('in delete-article-btn click');
    var id = $(this).attr("data-i");
    $.ajax({
      type: "POST",
      url: "/deleteArticle/" + id,
    })
      .then(function (status) {
        console.log("in then for delete article");
        console.log(status);
        location.reload();
      });
    return false;
  });



  /**
   * On-Click event to scrape the web site
   */
  /*
  $("#scrape-btn").on("click", function (event) {
    event.preventDefault();
    $.ajax({
      method: "GET",
      url: "/scrape/"
    })
      // With that done, bring up the scrape page complete with articles
      .then(function (data) {
        console.log("in then for scrape bjt");
        // location.href = "/scrape";
        return false;
        /*
        for (var i = 0; i < data.length; i++) {
          // Display the apropos information on the page
          $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
        }
        //  location.reload();
        // bjt $("#place-modal").modal();
      });

  });
      */

  /*
    // Whenever someone clicks a p tag
    $(document).on("click", "p", function () {
      // Empty the notes from the note section
      $("#notes").empty();
      // Save the id from the p tag
      var thisId = $(this).attr("data-id");
  
      // Now make an ajax call for the Article
      $.ajax({
        method: "GET",
        url: "/articles/" + thisId
      })
        // With that done, add the note information to the page
        .then(function (data) {
          console.log(data);
          // The title of the article
          $("#notes").append("<h2>" + data.title + "</h2>");
          // An input to enter a new title
          $("#notes").append("<input id='titleinput' name='title' >");
          // A textarea to add a new note body
          $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
          // A button to submit a new note, with the id of the article saved to it
          $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
  
          // If there's a note in the article
          if (data.note) {
            // Place the title of the note in the title input
            $("#titleinput").val(data.note.title);
            // Place the body of the note in the body textarea
            $("#bodyinput").val(data.note.body);
          }
        });
      });
  */
  /*
    // When you click the savenote button
    $(document).on("click", "#savenote", function () {
      // Grab the id associated with the article from the submit button
      var thisId = $(this).attr("data-id");
  
      // Run a POST request to change the note, using what's entered in the inputs
      $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
          // Value taken from title input
          title: $("#titleinput").val(),
          // Value taken from note textarea
          body: $("#bodyinput").val()
        }
      })
        // With that done
        .then(function (data) {
          // Log the response
          console.log(data);
          // Empty the notes section
          $("#notes").empty();
        });
  
      // Also, remove the values entered in the input and textarea for note entry
      $("#titleinput").val("");
      $("#bodyinput").val("");
    });
    */
});
