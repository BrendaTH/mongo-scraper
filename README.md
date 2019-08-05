## REPO Name: mongo-scraper at https://github.com/BrendaTH/mongo-scraper
## Heroku Deployment: https://hidden-sea-89819.herokuapp.com/show

### mongo-scraper: a web app that lets users view and leave comments on the latest news. This news is 'scraped' from the Huffington Post web site.

### OVERVIEW and OPERATION: 

**Home page** - route is '/'  This takes user to the main page. A carousel shows various pictures for visual interest. From the nav bar the user can go to 
* scrape articles 
* show saved articles 
* delete all saved articles. 


**Show page** - route is '/show' This route displays all the saved Articles. From here the user can 
* delete an article (removes it from Articles mongo database), 
* add a message about the article (adds the note to the Note mongo database and associates the note with the article)
* show all messages left by users about an article
* delete a saved message (deletes the message from the Notes mongo database and removes its association with the article)

**Scrape page** - route is '/scrape' This route scrapes the huffington post web site for articles and displays them on the page. The following information is displayed for each article:
* Title
* Summary
* Link to article (live)
* Save Article button - If the article is saved, it's removed from the scrape page.


Technology used:
* express
* express-handlebars
* mongoose
* cheerio
* axios
* morgan