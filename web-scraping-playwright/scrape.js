const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Función para descargar imagen
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err.message);
    });
  });
}

// Crear carpeta de imágenes si no existe
function ensureImageDir() {
  const imgDir = path.join(__dirname, 'images');
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir);
  }
  return imgDir;
}

// Descargar imágenes y actualizar rutas
async function processImages(shows) {
  const imgDir = ensureImageDir();

  for (const show of shows) {
    if (show.image) {
      try {
        const ext = path.extname(new URL(show.image).pathname) || '.jpg';
        const safeTitle = show.title.replace(/[\\/:*?"<>|]/g, '_');
        const filePath = path.join(imgDir, `${safeTitle}${ext}`);
        await downloadImage(show.image, filePath);
        console.log(`Imagen descargada: ${filePath}`);
        show.imagePath = `images/${safeTitle}${ext}`;
      } catch (err) {
        console.error(`Error al descargar imagen de ${show.title}:`, err);
      }
    }
  }

  return shows;
}

// Scraper del Teatro López de Ayala
async function scrapeLopezDeAyala(browser) {
  const page = await browser.newPage();
  await page.goto('https://www.teatrolopezdeayala.es/shows/list', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const shows = (await page.$$eval('.cmsmasters_slider_project_outer', elements =>
    elements.map(show => {
      const titleEl = show.querySelector('span a');
      const imageEl = show.querySelector('img');
      const venue = 'Teatro López de Ayala';

      const dateEls = show.querySelectorAll('.datePart');
      const dateText = dateEls[0] ? dateEls[0].innerText.slice(0, -3) : '';
      const timeText = dateEls[1] ? dateEls[1].innerText.slice(0, -2) : '';

      return {
        title: titleEl ? titleEl.innerText.trim() : 'Sin título',
        date: dateText || 'Sin fecha',
        time: timeText || 'Sin hora',
        venue,
        image: imageEl ? imageEl.src : null
      };
    })
  )).filter(show => show.title);

  await page.close();
  return await processImages(shows);
}

// Scraper del Gran Teatro de Cáceres
async function scrapeGranTeatro(browser) {
  const page = await browser.newPage();
  await page.goto('https://www.granteatrocc.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const shows = (await page.$$eval('.cbp-item-wrapper', elements =>
    elements.map(show => {
      const titleEl = show.querySelector('.listaeventostit');
      const imageEl = show.querySelector('img');
      const venue = 'Gran Teatro de Cáceres';

      const dateEls = show.querySelectorAll('.listaeventosfecha_txt');
      const date = dateEls[0]?.innerText?.trim() || 'Sin fecha';

      return {
        title: titleEl ? titleEl.innerText.trim() : 'Sin título',
        date,
        time: 'Sin hora',
        venue,
        image: imageEl ? imageEl.src : null
      };
    })
  )).filter(show => show.title);

  await page.close();
  return await processImages(shows);
}

// Función principal
(async () => {
  const browser = await chromium.launch({ headless: true });

  try {
    const allShows = [];

    const showsLopez = await scrapeLopezDeAyala(browser);
    allShows.push(...showsLopez);

    const showsCaceres = await scrapeGranTeatro(browser);
    allShows.push(...showsCaceres);

    fs.writeFileSync('data.json', JSON.stringify(allShows, null, 2), 'utf-8');
    console.log('Todos los datos guardados en data.json');
  } catch (err) {
    console.error('Error general:', err);
  } finally {
    await browser.close();
  }
})();
