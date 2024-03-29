const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const axios = require("axios");
const cheerio = require("cheerio");

const puppeteer = require("puppeteer");

async function getFavicons(url) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" }); // attend que le réseau soit inactif pendant au moins 500 ms

    const icons = await page.evaluate(() => {
      const icons = {
        icon: null,
        shortcut: null,
        "apple-touch-icon": null,
      };

      // Utilise document.querySelectorAll pour sélectionner les éléments souhaités
      document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach((elem) => {
        const rel = elem.getAttribute("rel");
        let href = elem.getAttribute("href");
        if (href) {
          // Crée une URL absolue si nécessaire
          if (!href.includes("://")) {
            const base = window.location.origin;
            href = new URL(href, base).href;
          }
          // Assigner l'URL de l'icône à la catégorie correspondante
          icons[rel] = href;
        }
      });

      return icons;
    });

    await browser.close();
    return icons;
  } catch (error) {
    console.error("Error fetching favicons with Puppeteer:", error);
    throw error;
  }
}

// Route pour tester la récupération des favicons
app.get("/get-favicons", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send("URL is required");
  }
  try {
    const icons = await getFavicons(url);
    res.json({ icons });
  } catch (error) {
    res.status(500).send("Error fetching favicons");
  }
});

// Route principale
app.get("/", (req, res) => {
  res.send("Service de favicon en cours de développement");
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});

module.exports = app;
