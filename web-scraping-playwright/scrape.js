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

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://www.teatrolopezdeayala.es/shows/list', { waitUntil: 'domcontentloaded' });

  await page.waitForTimeout(2000);

  const shows = await page.$$eval('.cmsmasters_slider_project_outer', elements =>
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
        venue: venue || 'Sin lugar',
        image: imageEl ? imageEl.src : null
      };
    })
  );

  // Crear carpeta si no existe
  const imgDir = path.join(__dirname, 'images');
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir);
  }

  // Descargar imágenes
  for (let i = 0; i < shows.length; i++) {
    const show = shows[i];
    if (show.image) {
      const ext = path.extname(new URL(show.image).pathname) || '.jpg';
      const safeTitle = show.title.replace(/[\\/:*?"<>|]/g, '_');
      const filePath = path.join(imgDir, `${safeTitle}${ext}`);
      try {
        await downloadImage(show.image, filePath);
        console.log(`Imagen descargada: ${filePath}`);
        show.imagePath = `images/${safeTitle}${ext}`;
      } catch (err) {
        console.error(`Error al descargar imagen de ${show.title}:`, err);
      }
    }
  }

  // Guardar JSON
  fs.writeFileSync('data.json', JSON.stringify(shows, null, 2), 'utf-8');
  console.log('Datos guardados en data.json');

  await browser.close();
})();
