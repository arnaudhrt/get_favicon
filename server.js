const express = require("express");
const app = express();
const port = 3000;
const axios = require("axios");
const cheerio = require("cheerio");

// Fonction pour récupérer les favicons
async function getFavicons(url) {
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      },
    });
    const $ = cheerio.load(html);
    const icons = {
      icon: null,
      shortcut: null,
      "apple-touch-icon": null,
    };
    $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').each((i, elem) => {
      const rel = $(elem).attr("rel");
      let href = $(elem).attr("href");
      if (!href.includes("://")) {
        href = new URL(href, url).href;
      }
      // Assigner l'URL de l'icône à la catégorie correspondante, en remplaçant si plusieurs sont trouvées
      icons[rel] = href;
    });
    return icons;
  } catch (error) {
    console.error("Error fetching favicons:", error);
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
