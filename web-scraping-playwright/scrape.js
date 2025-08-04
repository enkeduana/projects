const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://www.teatrolopezdeayala.es/shows/list', { waitUntil: 'domcontentloaded' });

  await page.waitForTimeout(2000);

  const shows = await page.$$eval('.cmsmasters_slider_project_inner', elements =>
    elements.map(show => {
      const titleEl = show.querySelector('span a');

      const dateEls = show.querySelectorAll('.datePart');
      const dateText = dateEls[0] ? dateEls[0].innerText.slice(0, -3) : '';
      const timeText = dateEls[1] ? dateEls[1].innerText.slice(0, -2) : '';

      return {
        title: titleEl ? titleEl.innerText.trim() : 'Sin título',
        date: dateText || 'Sin fecha',
        time: timeText || 'Sin hora',
      };
    })
  );

  
  console.log('\nPróximos espectáculos:\n');
  shows.forEach((show) => {
    
    console.log(`Título: ${show.title}`);
    console.log(`Fecha: ${show.date}`);
    console.log(`Hora: ${show.time}\n`);

  });

  

  fs.writeFileSync('data.json', JSON.stringify(shows, null, 2), 'utf-8');

  console.log('Datos guardados en data.json');

  await browser.close();
})();
