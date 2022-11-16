require('dotenv').config();

const path = require("path");

const fs = require("fs");
const basePath = process.cwd();
const {run_next_command} = require(`${basePath}/utils/functions/child_processes.js`);

const Artists = [
  "PABLO PICASSO",
  "GIOTTO DI BONDONE",
  "LEONARDO DA VINCI",
  "PAUL CÉZANNE",
  "REMBRANDT VAN RIJN",
  "DIEGO VELÁZQUEZ",
  "WASSILY KANDINSKY",
  "CLAUDE MONET",
  "MICHELANGELO MERISI DA CARAVAGGIO",
  "JAN VAN EYCK",
  "JOSEPH-MALLORD WILLIAM TURNER",
  "ALBRECHT DÜRER",
  "MICHELANGELO BUONARROTI",
  "FRANCISCO DE GOYA",
  "VINCENT VAN GOGH",
  "ÉDOUARD MANET",
  "HENRI MATISSE",
  "RAFFAELLO SANZIO",
  "JACKSON POLLOCK",
  "HILMA AF KLINT",
  "DOMENIKOS THEOTOKOPOULOS - EL GRECO",
  "PAUL GAUGUIN",
  "JEAN-MICHEL BASQUIAT",
  "EDVARD MUNCH",
  "TIZIANO VECELLIO DI GREGORIO",
  "FRANCIS BACON",
  "ANDY WARHOL",
  "SIR PETER PAUL RUBENS",
  "JOHANNES VERMEER",
  "JOAN MIRÓ",
  "TOMMASO MASACCIO",
  "ARTEMISIA GENTILESCHI",
  "PIERO DELLA FRANCESCA",
  "PIET MONDRIAN",
  "GUSTAVE COURBET",
  "NICOLAS POUSSIN",
  "GUSTAV KLIMT",
  "EUGÈNE DELACROIX",
  "PAOLO UCCELLO",
  "WILLIAM BLAKE",
  "CASPAR DAVID FRIEDRICH",
  "MAGDALENA CARMEN FRIDA KAHLO CLADERÓN",
  "KAZIMIR MALEVICH",
  "WINSLOW HOMER",
  "GERHARD RICHTER",
  "MARCEL DUCHAMP",
  "SANDRO BOTTICELLI",
  "EDWARD HOPPER",
  "JENNY SAVILLE",
  "MARK ROTHKO",
  "ANDREA MANTEGNA",
  "PAUL KLEE",
  "MARC CHAGALL",
  "HANS HOLBEIN THE YOUNGER",
  "EDGAR DEGAS",
  "FRA ANGELICO",
  "GEORGES SEURAT",
  "JEAN-ANTOINE WATTEAU",
  "SALVADOR DALÍ",
  "WILLEM DE KOONING",
  "DAVID HOCKNEY",
  "MAX ERNST",
  "TINTORETTO",
  "JASPER JOHNS",
  "UMBERTO BOCCIONI",
  "DUCCIO DA BUONINSEGNA",
  "ROGER VAN DER WEYDEN",
  "JOHN CONSTABLE",
  "JACQUES-LOUIS DAVID",
  "ARSHILLE GORKY",
  "GIORGIO BARBARELLI DA CASTELFRANCO",
  "HIERONYMUS BOSCH",
  "PIETER BRUEGEL THE ELDER",
  "SIMONE MARTINI",
  "FRANZ MARC",
  "THEODORE GÉRICAULT",
  "WILLIAM HOGARTH",
  "JEAN-BAPTISTE CAMILLE COROT",
  "GEORGES BRAQUE",
  "BERTHE MARIE PAULINE MORISOT",
  "JAMES ABBOT MCNEILL WHISTLER",
  "FREDERIC EDWIN CHURCH",
  "GEORGES DE LA TOUR",
  "JEAN.FRANÇOIS MILLET",
  "AMEDEO MODIGLIANI",
  "ÉLISABETH-LOUISE VIGÉE LE BRUN",
  "RENÉ MAGRITTE",
  "CIMABUE",
  "PIERRE-AUGUSTE RENOIR",
  "EGON SCHIELE",
  "DANTE GABRIEL ROSSETTI",
  "FRANS HALS",
  "CLAUDE LORRAIN",
  "ROY LICHTENSTEIN",
  "GEORGIA O’KEEFE",
  "BANKSY",
  "WILLIAM-ADOLPHE BOUGUEREAU",
  "GUSTAVE MOREAU",
  "GIORGIO DE CHIRICO",
  "FERNAND LÉGER",
  "JEAN-AUGUSTE-DOMINIQUE INGRES"
]

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// MAIN
async function main(title , date) {
  ensure_dir('dalle')

  let { prompt, artist } = get_prompt_and_artist(title);

  try {
    const edition = get_edition();

    const response = await openai.createImage({
      prompt: prompt,
      n: 1,
      size: "256x256",
      // size: "512x512",
      // size: "1024x1024",
    });

    // let response = { status: 200 } // TODO

    let { status, config, data } = response;

    // Extend with custom attrs
    data = { ...data, title, artist, date, description: prompt }

    fs.writeFileSync(
      `${basePath}/build/dalle/${edition}.json`,
      JSON.stringify({ status, data }, null, 2)
    );


    if (status === 200) {
      // RESULT
      // return data.data[0].url;

      // NEXT COMMAND
      return next_command();
    } else {
      console.log({ status, config, data })
      // return false;
    }
  } catch (error) {
    console.log(`Catch: ${error}`);
    // return false;
  }
}

function get_edition() {
  const files = fs.readdirSync(`${basePath}/build/dalle`);
  files.sort(function (a, b) {
    return a.split(".")[0] - b.split(".")[0];
  });

  let new_edition = 1
  if (files.length > 0) {
    const last_edition = files[files.length - 1].split('.')[0]
    new_edition = parseInt(last_edition) + 1
  }

  return new_edition;
}

function get_prompt_and_artist(title) {
  const artist = Artists[Math.floor(Math.random()*Artists.length)];
  const prompt = `${title} in the style of ${artist}`;
  return { prompt, artist };
}

function ensure_dir(dir) {
  if (!fs.existsSync(path.join(`${basePath}/build`, `/${dir}`))) {
    fs.mkdirSync(path.join(`${basePath}/build`, dir));
  }
}

function next_command () {
  run_next_command(`npm run download_dalle`);
}

const title = "Smoothie"; // TODO: pass from News API result
const date = new Date().toLocaleDateString("en-US") // TODO: pass from News API result
main(title , date); // TODO: pass from News API result

