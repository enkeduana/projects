const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Unificador y formateador de fechas
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

  // Ej: "Miércoles 06 de agosto"
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

  // Ej: "19 sep. 2025"
  const matchCorto = rawDate.match(/(\d{1,2})\s+([a-z]{3})\.?\s+(\d{4})/i);
  if (matchCorto) {
    const [_, day, month, year] = matchCorto;
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
