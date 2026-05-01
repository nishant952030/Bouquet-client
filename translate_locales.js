const fs = require('fs');
const path = require('path');

const localesDir = './client/public/locales';

const translations = {
  tl: {
    // Header & Create common
    "create.whoIsItFrom": "GALING KANINO?",
    "create.recipientPlaceholder": "Iyong Pangalan (Opsiyonal)",
    "create.noteIdeas": "MGA IDEYA SA MENSAHE",
    "create.seeAll": "Tingnan lahat",
    "create.shareWithLove": "IBAHAGI NANG MAY PAGMAMAHAL 💖",
    "create.free100": "100% Libre",
    "create.instantLink": "Instant link",
    "create.noLoginNeeded": "Hindi kailangan mag-login",

    // Home / Landing
    "home.sendFlowers": "Magpadala ng bulaklak na hindi niya malilimutan",
    "home.heroSub": "Isang digital bouquet na may kasamang mensahe mo, naipapadala sa ilang segundo — para sa pamilya, kaibigan, o sa kahit na sinong mahal mo.",
    "home.createFree": "GUMAWA NG BOUQUET",
    "home.bakeCake": "MAGHULMA NG CAKE",
    "home.instantShare": "INSTANT SHARE VIA WHATSAPP O LINK",
    "home.heroTitle1": "Ipadala ang perpektong",
    "home.heroTitle2": "virtual",
    "home.heroTitle3": "bouquet",
    
    // Create Layout
    "create.yourCanvas": "YONG CANVAS",
    "create.arrangeBouquet": "Ayusin ang iyong bouquet",
    "create.autoGenerate": "Auto Generate",
    "create.flowerType": "KLASE NG BULAKLAK",
    "create.flowers": "MGA BULAKLAK",
    "create.step1Label": "HAKBANG 1",
    "create.pickYourStems": "Pumili ng mga bulaklak",
    "create.step2Label": "HAKBANG 2",
    "create.writeYourNote": "Isulat ang iyong mensahe",
    "create.canvasForward": "ABANTE",
    "create.canvasRemove": "ALISIN",
    "create.canvasClear": "BURAHIN",

    // Presets (titles and desc)
    "create.presetTitle_romantic-arc": "Romantikong Arko",
    "create.presetDesc_romantic-arc": "Isang malambot at balanseng limang-bulaklak na kurba — walang kupas at malambing.",
    "create.presetTitle_sunshine-burst": "Pagsabog ng Araw",
    "create.presetDesc_sunshine-burst": "Malapad, nakakasilaw, at masaya — isang pagsabog ng tuwa para sa isang espesyal na tao.",
    "create.presetTitle_minimal-trio": "Simpleng Tatlo",
    "create.presetDesc_minimal-trio": "Tatlong bulaklak. Malinis. Sinasabi ang lahat kahit walang masyadong ginagawa.",
    "create.presetTitle_cascading-waterfall": "Bumabagsak na Talon",
    "create.presetDesc_cascading-waterfall": "Isang mataas na gitna na may bumabagsak na mga bulaklak sa gilid — modernong ganda.",
    "create.presetTitle_garden-dome": "Hardin na Dome",
    "create.presetDesc_garden-dome": "Puno, bilog, at malago — ang klasikong buket.",
    "create.presetTitle_wild-meadow": "Ligalig na Parang",
    "create.presetDesc_wild-meadow": "Maluwag ang pagkakaayos, asimetriko, at buhay — parang kapipitas lang sa parang.",
    "create.presetTitle_solo-statement": "Nagiisang Pahayag",
    "create.presetDesc_solo-statement": "Isang perpektong bulaklak. Dahil minsan ang isa ay higit pa sa sapat.",
    "create.presetTitle_lovely-pair": "Kaibig-ibig na Pares",
    "create.presetDesc_lovely-pair": "Dalawang bulaklak na nakasandal sa isa't isa — tahimik na simbolo ng pagsasama.",
    "create.presetTitle_vertical-tower": "Patayong Tore",
    "create.presetDesc_vertical-tower": "Mataas, arkitektural, at kapansin-pansin.",
    "create.presetTitle_lunar-crescent": "Gasuklay na Buwan",
    "create.presetDesc_lunar-crescent": "Isang kurbang gasuklay — patula at hindi malilimutan.",

    // Cake Controls
    "cakeControls.recipientName": "Pangalan ng tatanggap",
    "cakeControls.recipientPlaceholder": "hal. Aanya",
    "cakeControls.occasion": "Okasyon",
    "cakeControls.flavor": "Lasang Cake",
    "cakeControls.cakeStoreys": "Patong ng Cake",
    "cakeControls.addStorey": "Magdagdag ng patong",
    "cakeControls.remove": "Alisin",
    "cakeControls.scene": "Eksena",
    "cakeControls.rotating": "Umiikot",
    "cakeControls.stopped": "Nakahinto",
    "cakeControls.stopRotation": "Itigil ang pag-ikot",
    "cakeControls.startRotation": "Ikotin",
    "cakeControls.clickTool": "I-click ang tool",
    "cakeControls.candle": "Kandila",
    "cakeControls.cream": "Krema",
    "cakeControls.topping": "Pang-ibabaw",
    "cakeControls.candles": "Mga Kandila",
    "cakeControls.addCandle": "Magdagdag ng kandila",
    "cakeControls.clear": "Burahin",
    "cakeControls.creamSwirls": "Kremang swirl",
    "cakeControls.addCream": "Magdagdag ng krema",
    "cakeControls.toppings": "Mga pang-ibabaw",
    "cakeControls.addTopping": "Magdagdag ng pang-ibabaw",
    "cakeControls.birthdayNote": "Mensahe para sa Kaarawan",
    "cakeControls.notePlaceholder": "Magsulat ng hiling na makikita nila pagkatapos hipan ang kandila.",
    "cakeControls.bakeCake": "Hulmahin ang Cake"
  }
};

for (const lang of Object.keys(translations)) {
  const filePath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const current = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const toUpdate = translations[lang];
    for (const key of Object.keys(toUpdate)) {
      current[key] = toUpdate[key];
    }
    fs.writeFileSync(filePath, JSON.stringify(current, null, 2));
    console.log(`Updated translations for ${lang}`);
  }
}
