//
//  Project: Waktu Solat Discord Webhook Bot
//  Author:  Muhammad Syahman
//  Date:    2021-10-15
//  Data:    2022-solat.json from JAKIM (https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=year&zone=WLY01)
//

const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const { WEBHOOK_URL } = require("./config.json");

// Get the data from the json file
const jsonPath = path.join(__dirname, "./data/2022-solat.json");

// Read the file
const json = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

// Get all the timestamps
const timestamps = json.prayerTime.map((item) => {
  return item;
});

// Get today's date in the format dd-MMM-yyyy
const today = new Date()
  .toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  .split(" ")
  .join("-");

// Get all the data for today
const day = timestamps.find((item) => {
  return item.date === today;
});

// Filter out the keys we want
const filteredKeys = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const filtered = Object.entries(day)
  .filter(([key]) => filteredKeys.includes(key))
  .map((item) => item[1]);

// Convert to timestamp
const converted = filtered.map((item) => {
  const time = Date.parse(day.date + " " + item);
  return time;
});

// Combine the keys and values
const combined = filteredKeys.map((key, index) => {
  return { [key]: converted[index] };
});

// The updated data
const waktuSolat = combined;

// Discord webhook data
const embedData = {
  content: null,
  embeds: [
    {
      title: "Waktu Solat",
      description:
        "Telah masuk waktu solat fardhu maghrib (16:34) bagi kawasan WP Kuala Lumpur & yg sewaktu dengannya",
      color: 9436928,
      fields: [
        {
          name: "Date",
          value: "15-Dec-2022",
          inline: true,
        },
        {
          name: "Subuh",
          value: "05:58",
          inline: true,
        },
        {
          name: "Zohor",
          value: "13:11",
          inline: true,
        },
        {
          name: "Asar",
          value: "16:34",
          inline: true,
        },
        {
          name: "Maghrib",
          value: "19:08",
          inline: true,
        },
        {
          name: "Isyak",
          value: "20:23",
          inline: true,
        },
      ],
    },
  ],
  username: "Waktu Solat",
  attachments: [],
};

// Convert name to readable name
function betterName(name) {
  switch (name) {
    case "fajr":
      return "Subuh";
    case "dhuhr":
      return "Zohor";
    case "asr":
      return "Asar";
    case "maghrib":
      return "Maghrib";
    case "isha":
      return "Isyak";
  }
}

// Prepare data for discord webhook
function prepareData(name) {
  const base = embedData;
  const embed = base.embeds[0];

  const solat = betterName(name);

  const dailyWaktu = [
    { name: "Date", value: day.date, inline: true },
    { name: "Subuh", value: day.fajr, inline: true },
    { name: "Zohor", value: day.dhuhr, inline: true },
    { name: "Asar", value: day.asr, inline: true },
    { name: "Maghrib", value: day.maghrib, inline: true },
    { name: "Isyak", value: day.isha, inline: true },
  ];

  embed.description = `Telah masuk waktu solat fardhu ${solat} bagi kawasan WP Kuala Lumpur & yg sewaktu dengannya`;
  embed.fields = dailyWaktu;

  base.embeds[0] = embed;
  console.log(base, base.embeds[0]);
}

// Send to discord webhook
async function send() {
  console.log("Sending to discord...");
  const hook = WEBHOOK_URL;
  const data = embedData;
  await fetch(hook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  console.log("Sent to discord!");
}

// Check if the current time is within 500ms of the timestamp
// If it is, prepare data and send to discord webhook
function checkData() {
  const now = Date.now();
  waktuSolat.forEach((el) => {
    const k = Object.keys(el)[0];
    const v = el[k];
    const check = now < v + 500 && now > v - 500;

    if (check) {
      prepareData(k);
      send();
    }
  });
}

// Check every second
setInterval(() => {
  checkData();
}, 1000);

console.log("Bot is running...");

// test run
prepareData("isha");
send();
