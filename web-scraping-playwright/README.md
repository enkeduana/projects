
## Web Scraping with Playwright

This project is a basic test to scrape two local theatre websites for upcoming events using [Playwright](https://playwright.dev/).

The main goal is to extract event information (such as title, date, time and thumbnail picture) by automating a Chromium browser and querying DOM elements.

The extracted results are printed directly to the console, and on a basic interface that shows every event as a bootstrap card.

Project structure:

    .
    ├── scrape.js         # Main scraping script
    |── index.html        # Basic interface
    |── data.json         # Event storage
    ├── package.json      # Node project configuration
    |── images            # Event thumbnails storage
    └── README.md         # Project documentation

Event sources:

[Teatro López de Ayala, Badajoz (Spain)](https://www.teatrolopezdeayala.es/shows/list)
[Gran Teatro de Cáceres, Cáceres (Spain)](https://www.granteatrocc.com/programacion.php)

### 1. Environment Setup

It is necessary to have **Node.js** installed. You can download it from [nodejs.org](https://nodejs.org/).

### 2. Manual project setup

The following steps allow you to create the project from scratch. This way it is not necessary to download the project from the repository.

1. Create a new directory.
2. Open a terminal and navigate into the project folder.
3. Initialize a Node.js project by executing:
    ```npm init -y```
4. Install Playwright:
    ```npm install playwright```
5. Install the required browsers:
    ```npx playwright install```

### 3. Using this repository

If you prefer to use this repository:

1. Clone or download the project folder.
2. In the project directory, run:
    ```npm install```
    ```npx playwright install```


### 4. Running the project

To execute the script (scrape.js):

- Open a terminal.
- Navigate to the project directory.
- Run the following command:

    ```node scrape.js```
    
The event date will be saved in ```data.json```    
The scraped data will be logged to the console.

To visualize the events on the interface open ```index.html``` on a website browser. This file takes the event information from ```data.json``` and present it on a html format using bootstrap.



### 5. Website scraping policies

Before scraping any website, always check whether the site allows it by visiting its robots.txt file. Simply add /robots.txt to the base URL, for example:

    https://example.com/robots.txt
    
Typical entries in a robots.txt file:

    User-agent: *       # Applies to all bots
    Disallow: /private  # This path is off-limits
    Allow: /public      # This path is allowed

**Important**: ```robots.txt``` is not a legal restriction, but a technical convention. Scraping a site that disallows bots is generally discouraged and may violate its Terms of Service.


### 6. Test websites for practice

Here are some public websites designed specifically for scraping practice:

- https://quotes.toscrape.com/
- https://books.toscrape.com/

