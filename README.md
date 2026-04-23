About: A customizable link-in-bio page built as a beginner coding project and commented to aid in learning HTML, CSS and JavaScript. Meant to replace my "Linktree" in my Instagram bio. 

Project Name: Natalie's Custom Link Page

Project Description: static web page that displays multiple custom links and an automatically updating "currently reading" widget using Goodreadss RSS.

Link: https://mezierenatalie.github.io/Link-Page/

Features: 
* Auto-updating "currently reading" widget using Goodreads RSS
* Favicon icons pulled from linked sites automatically
* Responsive to mobile layout

How it Works: The "currently reading" widget fetches your Goodreads "currently-reading" shelf RSS feed on every page load. But because browsers block direct requests to other websites, the RSS URL is routed through allorigins.win, a free CORS proxy, to fetch the data and pass it back. The RSS response is parsed as XML, the most recently added book entry is extracted, the title, author, and cover image are added to a styled card for viewing. 

How to Customize:
* Change the Goodreads user: update "GOODREADS_USER_ID" in the "currentlyreadingscript.js" file with your own Goodreads User ID.
  * To find your Goodreads User ID:
    * Go to Goodreads > Profile
    * Your User ID is the number in the URL after: https://www.goodreads.com/user/show/[#########]
    * Note: "currently reading" shelf must be set to public.
      * Go to "Account Settings" > "Account & Notifications" > "Privacy"
      * Click "anyone (including search engines)" under "Who can view my profile:"
* Add or change link buttons: update the href URL, favicon domain, and display text inside the <a class="link-button"> block.
* Change colors: update hex codes in the :root block in the "linkpagestyles.css" file.

Technologies Used: HTML, CSS, JavaScript
