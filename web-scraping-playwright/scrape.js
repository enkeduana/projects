

// Import the 'chromium' browser object from Playwright for browser automation tasks
const { chromium } = require('playwright');

// Import Node.js built-in 'fs' module to work with the file system (read/write files)
const fs = require('fs');

// Import Node.js built-in 'path' module to handle and transform file and directory paths
const path = require('path');

// Import Node.js built-in 'https' module to make HTTPS requests (download data from secure URLs)
const https = require('https');



/**
 * Parses a raw date string in Spanish and converts it to the "DD-MM-YYYY" format,
 * ensuring all dates follow the same pattern even if they come from different sources.
 * 
 * @param {string} rawDate - The raw date string to be parsed.
 * @returns {string|undefined} - The formatted date string or undefined if parsing fails.
 */
function parseDate(rawDate) {
  if (!rawDate || typeof rawDate !== 'string') return null;

  rawDate = rawDate.trim().toLowerCase();

  const longMonthNames = {
    'enero': '01', 'febrero': '02', 'marzo': '03',
    'abril': '04', 'mayo': '05', 'junio': '06',
    'julio': '07', 'agosto': '08', 'septiembre': '09',
    'octubre': '10', 'noviembre': '11', 'diciembre': '12'
  };

  const shortMonthNames = {
    'ene': '01', 'feb': '02', 'mar': '03',
    'abr': '04', 'may': '05', 'jun': '06',
    'jul': '07', 'ago': '08', 'sep': '09',
    'oct': '10', 'nov': '11', 'dic': '12'
  };


/**
 * Pattern detail:
 * 
 * / ... /i        → case insensitive (matches uppercase and lowercase)
 * (\d{1,2})       → group 1: day (one or two digits)
 * \s+             → one or more white spaces
 * de              → the word "de"
 * \s+             → one or more white spaces
 * ([a-zá]+)       → group 2: month name (letters a–z or "á"; case insensitive)
 * 
 * Example: "Miércoles 06 de agosto"
 */
  const matchLongMonth = rawDate.match(/(\d{1,2})\s+de\s+([a-zá]+)/i);
  if (matchLongMonth) {
    const [_, day, month] = matchLongMonth;
    const monthNum = longMonthNames[month];
    if (monthNum) {
      const today = new Date();
      const year = today.getFullYear();
      return `${day.padStart(2, '0')}-${monthNum}-${year}`;
    }
  }


  /**
 * Pattern detail:
 * 
 * / ... /i          → case insensitive (matches uppercase and lowercase)
 * (\d{1,2})         → group 1: day (one or two digits)
 * \s+               → one or more white spaces
 * ([a-z]{3})        → group 2: abbreviated month name (three letters a–z; case insensitive)
 * \.?               → optional dot (to match both "sep" and "sep.")
 * \s+               → one or more white spaces
 * (\d{4})           → group 3: year (exactly four digits)
 * 
 * Example: "19 sep. 2025"
 */
  const matchShort = rawDate.match(/(\d{1,2})\s+([a-z]{3})\.?\s+(\d{4})/i);
  if (matchShort) {
    const [_, day, month, year] = matchShort;
    const monthNum = shortMonthNames[month];
    if (monthNum) {
      return `${day.padStart(2, '0')}-${monthNum}-${year}`;
    }
  }

  return null;
}


// Descargar imagen
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err.message);
    });
  });
}

// Crear carpeta si no existe
function ensureImageDir() {
  const imgDir = path.join(__dirname, 'images');
  if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir);
  return imgDir;
}

// Descargar imágenes y actualizar paths
async function processImages(shows) {
  const imgDir = ensureImageDir();

  for (const show of shows) {
    if (show.image) {
      try {
        const ext = path.extname(new URL(show.image).pathname) || '.jpg';
        const safeTitle = show.title.replace(/[\\/:*?"<>|]/g, '_');
        const filePath = path.join(imgDir, `${safeTitle}${ext}`);
        await downloadImage(show.image, filePath);
        console.log(`Downloaded image: ${filePath}`);
        show.imagePath = `images/${safeTitle}${ext}`;
      } catch (err) {
        console.error(`Failed to download image for ${show.title}:`, err);
      }
    }
  }

  return shows;
}

// Scraper Teatro López de Ayala
async function scrapeLopezDeAyala(browser) {
  const page = await browser.newPage();
  await page.goto('https://www.teatrolopezdeayala.es/shows/list', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const rawShows = await page.$$eval('.cmsmasters_slider_project_outer', elements =>
    elements.map(show => {
      const titleEl = show.querySelector('span a');
      const imageEl = show.querySelector('img');
      const dateEls = show.querySelectorAll('.datePart');

      const dateText = dateEls[0]?.innerText.slice(0, -3) || '';
      const timeText = dateEls[1]?.innerText.slice(0, -2) || '';

      return {
        title: titleEl?.innerText.trim() || '',
        rawDate: dateText,
        time: timeText || 'Sin hora', // No time
        venue: 'Teatro López de Ayala',
        image: imageEl?.src || null
      };
    })
  );

  await page.close();

  const shows = rawShows
    .filter(show => show.title)
    .map(show => ({
      ...show,
      date: parseDate(show.rawDate) || 'Sin fecha' // No date
    }));

  return await processImages(shows);
}

// Scraper Gran Teatro de Cáceres
async function scrapeGranTeatro(browser) {
  const page = await browser.newPage();
  await page.goto('https://www.granteatrocc.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const rawShows = await page.$$eval('.cbp-item-wrapper', elements =>
    elements.map(show => {
      const titleEl = show.querySelector('.listaeventostit');
      const imageEl = show.querySelector('img');
      const dateEls = show.querySelectorAll('.listaeventosfecha_txt');

      return {
        title: titleEl?.innerText.trim() || '',
        rawDate: dateEls[0]?.innerText.trim() || '',
        time: null,
        venue: 'Gran Teatro de Cáceres',
        image: imageEl?.src || null
      };
    })
  );

  await page.close();

  const shows = rawShows
    .filter(show => show.title)
    .map(show => ({
      ...show,
      date: parseDate(show.rawDate) || 'Sin fecha' // No date
    }));

  return await processImages(shows);
}

// Main
(async () => {
  const browser = await chromium.launch({ headless: true });

  try {
    const allShows = [];

    const showsLopez = await scrapeLopezDeAyala(browser);
    const showsCaceres = await scrapeGranTeatro(browser);

    allShows.push(...showsLopez, ...showsCaceres);

    fs.writeFileSync('data.json', JSON.stringify(allShows, null, 2), 'utf-8');
    console.log('All data stored in data.json');
  } catch (err) {
    console.error('General error:', err);
  } finally {
    await browser.close();
  }
})();
