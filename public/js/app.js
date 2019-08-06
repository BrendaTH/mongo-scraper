// run this code when we load the page
$(function () {
  console.log("in js on fe bjt");

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

  /**
   * On-Click event bring up modal for new note
   */
  $(".add-note-btn").on("click", function (event) {
    console.log('in add-note-btn click');
    event.preventDefault();
    // add the id for this article
    var p = $("<p>").text("Id: " + $(this).data('id'));
    $("#noteId").append(p);
    // cause modal to pop up
    $("#add-note-modal").modal();
  });

  /**
   * On-Click event submit the new note
   * to the database
   */
  $("#note-submit").on("click", function (event) {
    event.preventDefault();
    var articleId = $("#noteId").text().substring(5);
    console.log("id is " + articleId);
    console.log("summary is " + $("#note-summary").val().trim());

    var newNote = {
      summary: $("#note-summary").val().trim(),
    };

    // Send the Post request to save the note and associate with this article
    $.ajax("/articles/" + articleId, {
      type: "POST",
      data: newNote
    }).then(
      function (dbArticle) {
        console.log("created new note");
        console.log(dbArticle);
        // Reload the saved  to get the updated list
        location.reload();
      }
    )
  });

  /**
   * On-Click event delete a saved article from database 
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
   * On-Click event delete a saved note from database 
   */
  $("#notes-in-modal").on("click", ".delete-note-button", function() {
  // $(".delete-note-button").on("click", function () {
    console.log('in delete-note-button click');
    var id = $(this).attr("data-id");
    var articleId = $(this).attr("data-articleId");
    $.ajax({
      type: "POST",
      url: "/deleteNote/" + id,
      data: {
        articleId
      }
    })
      .then(function (status) {
        console.log("in then for delete article");
        console.log(status);
        location.reload(); 
      });
    return false;
  });

  /**
   * On-Click event show all notes for this article 
   */
  $(".show-all-notes-btn").on("click", function (event) {
    event.preventDefault();
    console.log('in delete-article-btn click');
    var id = $(this).attr("data-id");
    console.log("show all notes " + id);
    $.ajax({
      type: "GET",
      url: "/getNotes/" + id,
    })
      .then(function (notes) {
        console.log("bjt in then for get notes for an article");
        console.log(notes);
        $('#notes-in-modal').empty();
        // for each note put it in an <li> tag and append to modal
        for (var i = 0; i < notes.length; i++) {
          console.log("body notes " + notes[i].body);
          var myDiv = $('<div>');
          var noteId = notes[i]._id;
          var myString = '<div>' + notes[i].body + '<button type="button" class="button btn btn-primary delete-note-button" data-articleId="' + id + '" data-id="' + noteId + '"> delete </button><div>';
          var myButton = $(myString);
          myDiv.append(myButton);
          myDiv.appendTo('#notes-in-modal');
          $("#show-note-modal").modal('toggle');
        }
        if (notes.length === 0) {
          console.log("body notes: no notes to show " );
          var myDiv = $('<div>');
          var myString = '<div> No Available Notes for This Article<div>';
          var myButton = $(myString);
          myDiv.append(myButton);
          myDiv.appendTo('#notes-in-modal');
          $("#show-note-modal").modal('toggle');
        }

      });
    return false;
  });


});
