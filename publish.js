if (process.argv.length < 4 || process.argv.length > 5) {
  console.error(`Error 1: wrong number of arguments.
  Usage:
  npm run publish <input file> <first row to process> [last row to process]
  `);
  process.exit(1);
}

require("chromedriver");
require("dotenv").config();
const csv = require("csvtojson");
const path = require("path");

const csvFilePath = path.resolve("input", process.argv[2]);

const namesFilePath = path.resolve("input", "names.csv");

const eventNumber = process.argv[3];

const { Builder, By, Key, until } = require("selenium-webdriver");

(async function example() {
  // Load input file into jsonArray
  const jsonArray = await csv().fromFile(csvFilePath);

  // Load names file into namesJson
  const namesJson = await csv().fromFile(namesFilePath);

  //console.log(jsonArray[eventNumber]);

  let driver = await new Builder().forBrowser("chrome").build();
  try {
    await driver.get(process.env.PT_SITE);
    await driver
      .findElement(By.css('input[name="mail"]'))
      .sendKeys(process.env.PT_USER);
    await driver
      .findElement(By.css('input[name="pass"]'))
      .sendKeys(process.env.PT_PASSWORD);
    await driver.findElement(By.css('input[name="login"]')).click();

    // wait for page to load
    await driver.wait(until.elementLocated(By.className("newEvent")));
    await driver.findElement(By.className("newEvent")).click();

    // first section
    await driver
      .findElement(By.css('select[name="natureEvent"]'))
      .sendKeys(jsonArray[eventNumber].A_Nature);

    // other nature
    if (/autre/i.test(jsonArray[eventNumber].A_Nature)) {
      await driver
        .findElement(By.css('input[name="type_autre_event"]'))
        .sendKeys(jsonArray[eventNumber].A_Autre);
    }

    await driver
      .findElement(By.css('input[name="titreEvent"]'))
      .sendKeys(jsonArray[eventNumber].A_Titre);
    await driver
      .findElement(By.css('input[name="surtitreEvent"]'))
      .sendKeys(jsonArray[eventNumber].A_Surtitre);
    await driver
      .findElement(By.css('input[name="serieEvent"]'))
      .sendKeys(jsonArray[eventNumber].A_Série);

    await driver
      .findElement(By.name("descEvent"))
      .sendKeys(
        jsonArray[eventNumber].DESCRIPTION.replace(/<br>/g, "\n").replace(
          /<\/?.+?>/g,
          ""
        )
      );

    await driver
      .findElement(By.css('select[name="langue"]'))
      .sendKeys(jsonArray[eventNumber].A_Langue);
    await driver
      .findElement(By.css('select[name="categorie"]'))
      .sendKeys(jsonArray[eventNumber].A_Catégories);

    // second section

    let namesInEvent = jsonArray[eventNumber].DESCRIPTION.match(/<b>.+?<\/b>/g)
      .map(name => name.replace(/<\/?b>/g, ""))
      .filter(name =>
        namesJson.some(jsonName => jsonName.nom_complet === name)
      );

    // remove duplicate names
    namesInEvent = [...new Set(namesInEvent)];

    for (let i = 0; i < namesInEvent.length - 1; i++) {
      await driver.findElement(By.className("addIntervenant")).click();
    }

    const prenoms = await driver.findElements(
      By.css('input[name="prenomIntervenant[]"]')
    );
    const noms = await driver.findElements(
      By.css('input[name="nomIntervenant[]"]')
    );

    for (let i = 0; i < namesInEvent.length; i++) {
      let prenom = namesJson.filter(o => o.nom_complet === namesInEvent[i])[0]
        .prenom;
      await prenoms[i].sendKeys(prenom);
      let nom = namesJson.filter(o => o.nom_complet === namesInEvent[i])[0].nom;
      await noms[i].sendKeys(nom);
    }

    // third section

    const illustrationPath = path.join(
      // NOTE: this only works for Unix-compatible systems:

      "/",
      ...jsonArray[eventNumber].A_Illustration.split(":")
    );

    await driver
      .findElement(By.css('input[name="logoE"]'))
      .sendKeys(illustrationPath);

    await driver
      .findElement(By.css('input[name="pageWeb"]'))
      .sendKeys(jsonArray[eventNumber].A_Page);

    // fourth section
    await driver
      .findElement(By.css('input[name="dateEvent"]'))
      .sendKeys(jsonArray[eventNumber].A_Date);
    await driver
      .findElement(By.css('input[name="heureD"]'))
      .sendKeys(jsonArray[eventNumber].A_HeureDéb);
    await driver
      .findElement(By.css('input[name="heureF"]'))
      .sendKeys(jsonArray[eventNumber].A_HeureFin);

    // fifth section
    await driver
      .findElement(By.css('input[name="autreRenseigment"]'))
      .sendKeys(jsonArray[eventNumber].A_Autres);
    await driver
      .findElement(By.css('input[name="prix"]'))
      .sendKeys(jsonArray[eventNumber].A_prix);
    await driver
      .findElement(By.css('input[name="reservation"]'))
      .sendKeys(jsonArray[eventNumber].A_Réservation);

    // fifth section
    await driver
      .findElement(By.name("akademFilm"))
      .sendKeys(jsonArray[eventNumber].A_Autorisez);
    await driver
      .findElement(By.name("autorisation"))
      .sendKeys(jsonArray[eventNumber].A_connaissance1);
    await driver
      .findElement(By.name("regie"))
      .sendKeys(jsonArray[eventNumber].A_connaissance2);
    await driver
      .findElement(By.name("autreEnreg"))
      .sendKeys(jsonArray[eventNumber].A_Enregistrements);
    await driver
      .findElement(By.name("AutreR"))
      .sendKeys(jsonArray[eventNumber].A_Renseignement);

    //    await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
    //    await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
  } finally {
    //    await driver.quit();
  }
})();
