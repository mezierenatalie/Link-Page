// defines the goodreads user id constant
const GOODREADS_USER_ID = '106774701';

// finds the currently reading container in the HTML and stores a reference to it so JavaScript can fill it later
const containercurrentlyreading = document.getElementById('containercurrentlyreading');

// defines function that replaces the container contents with a skeleton loading animation
function showSkeleton() {
    containercurrentlyreading.innerHTML = `
                  <div class="skeleton">
                    <div style="display:flex;gap:1.25rem;align-items:flex-start">
                      <div class="skel-line" style="width:80px;height:116px;border-radius:6px;flex-shrink:0"></div>
                      <div style="flex:1">
                        <div class="skel-line" style="height:16px;width:60%;margin-bottom:10px"></div>
                        <div class="skel-line" style="height:22px;width:90%;margin-bottom:6px"></div>
                        <div class="skel-line" style="height:22px;width:70%;margin-bottom:12px"></div>
                        <div class="skel-line" style="height:13px;width:40%;margin-bottom:8px"></div>
                        <div class="skel-line" style="height:3px;width:100%;margin-bottom:16px"></div>
                        <div class="skel-line" style="height:13px;width:55%"></div>
                      </div>
                    </div>
                  </div>`;
}

// defines function that replaces the container contents with an error card
function showError(msg) {
    containercurrentlyreading.innerHTML = `
                  <div class="error-card">
                    <div class="error-icon">📚</div>
                    <p class="error-title">Couldn't load book</p>
                    <p class="error-msg">${msg}</p>
                  </div>`;
}

//defines function that builds and shows the book card in the currently reading container, by using the "book" object containing the book title, author, cover image and link
function showBook(book) {
    // stores the cover image html so it can be used later and displays the placeholder image if there is an error
    const coverHtml = book.cover
        ? `<img class="cover" src="${book.cover}" alt="Cover of ${book.title}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : '';
    // replaces the container contents with the fully built book card by inserting the book data
    containercurrentlyreading.innerHTML = `
                  <a class="card" href="${book.link}" target="_blank" rel="noopener">
                    <div class="cover-wrap">
                      ${coverHtml}
                      <div class="cover-placeholder" ${book.cover ? 'style="display:none"' : ''}>📖</div>
                    </div>
                    <div class="info">
                      <div class="reading-tag"><span class="reading-dot"></span>Reading now</div>
                      <h1 class="title">${book.title}</h1>
                      <p class="author">by ${book.author}</p>
                      <p class="cta">View on Goodreads
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </p>
                    </div>
                  </a>`;
}

// defines an async function to load the book data after fetching it from the goodreads site
async function loadBook() {
    // confirms that there is a good reads user id constant assigned, and shows an error if it is not assigned
    if (GOODREADS_USER_ID === 'YOUR_GOODREADS_USER_ID') {
        showError('Please replace <code>YOUR_GOODREADS_USER_ID</code> in the script with your actual Goodreads user ID.');
        return;
    }

    // shows the skeleton function defined earlier while fetching the goodreads data
    showSkeleton();

    // adds the goodreads user id to a prewritten url to access the goodreads rss feed for the currently reading shelf
    const rssUrl = `https://www.goodreads.com/review/list_rss/${GOODREADS_USER_ID}?shelf=currently-reading`;

    // builds a url for a CORS proxy to fetch the RSS (required for browser-side fetching)
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;

    // tries to run the code and displays an error message if there is an error
    try {
        // makes a request to the proxy url and waits for the response, displays an error if there is an error, and reads the response
        const res = await fetch(proxyUrl);
        // if the response is not ok, deliberately triggers an error to be caught by the catch block
        if (!res.ok) throw new Error(`Network error: ${res.status}`);
        const data = await res.json();

        // defines a parser to convert the raw rss text into a format javascript can read (text/xml)
        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, 'text/xml');

        // searches the parsed xml document for all "item" elements and shows an error message if the search returns a 0
        const items = xml.querySelectorAll('item');
        if (items.length === 0) {
            showError(`No books found on your "currently-reading" shelf. Make sure your shelf is public and you have at least one book marked as currently reading on <a class="error-link" href="https://goodreads.com" target="_blank">Goodreads</a>.`);
            return;
        }

        // defines item as the most recently added book to the currently reading shelf and grabs the title, link, guid, author name and displays "unknown title"" for a missing title and a blank for other missing elements
        const item = items[0];

        const title = item.querySelector('title')?.textContent?.trim() || 'Unknown Title';
        const link = item.querySelector('link')?.textContent?.trim()
            || item.querySelector('guid')?.textContent?.trim()
            || `https://www.goodreads.com`;
        const authorRaw = item.querySelector('author_name')?.textContent?.trim()
            || item.querySelector('author')?.textContent?.trim()
            || '';

        // assigns the cover image after looking for the book_large_image_url, book_medium_image_url, or img in description
        let cover = item.querySelector('book_large_image_url')?.textContent?.trim()
            || item.querySelector('book_medium_image_url')?.textContent?.trim()
            || item.querySelector('book_small_image_url')?.textContent?.trim()
            || '';

        // if there is no cover this assigns the parsed img src from the description HTML to the cover
        if (!cover) {
            const descHtml = item.querySelector('description')?.textContent || '';
            const imgMatch = descHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch) cover = imgMatch[1];
        }

        // cleans up the Goodreads thumbnail to get a larger image
        if (cover && cover.includes('._SY')) {
            cover = cover.replace(/\._SY\d+_/, '._SY300_');
        }

        // shows the book data just fetched
        showBook({ title, author: authorRaw, cover, link });

    }
    // if the try block fails the catch runs the error message
    catch (err) {
        // logs the error details to browser developer tools for debugging
        console.error(err);
        showError(`Couldn't fetch your Goodreads shelf. This may be a temporary network issue — try refreshing. <br><br>If it keeps happening, make sure your Goodreads profile and shelf are set to <strong>public</strong>.`);
    }
}

// runs the load book function
>>>>>>> 81a646b122baf02612c60f8b5fbbbd1fa001b95c
loadBook();