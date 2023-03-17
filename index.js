//
//  Project     : Waktu Solat Discord Webhook Bot
//  Author      : Muhammad Syahman (0xN1)
//  Last Update : 18 Dec 2022
//  Data        : e-solat JAKIM (https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=year&zone=WLY01)
//

const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const moment = require("moment-timezone");
require("dotenv").config();

const config = require("./config.json");

const DEBUG_MODE = false;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const LOG_WEBHOOK_URL = process.env.LOG_DISCORD_WEBHOOK_URL;

let waktuSolat;
let day;

// Set the timezone
moment.tz.setDefault("Asia/Kuala_Lumpur");

// Get the initial data from the json file
const jsonPath = path.join(__dirname, "./data/solatData.json");

// Read the file
let json = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

// Get the updated data from the API
async function getUpdatedData() {
  try {
    const res = await fetch(
      "https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=year&zone=" +
        config.zone
    ).then((res) => res.json());
    json = res;
  } catch (error) {
    console.log(error);
  }
}

// create a function to store updated data to json file
function updateData() {
  return fs.writeFile(jsonPath, JSON.stringify(json, null, 2), (err) => {
    if (err) throw err;
    console.log("Data updated");
  });
}

// Process data
async function processData() {
  // Get all the timestamps
  const timestamps = json.prayerTime.map((item) => {
    return item;
  });
  // console.log("timestamps:\n", timestamps);

  // Get today's date
  const today = moment().format("DD-MMM-YYYY");
  // console.log("today:\n", today);

  // Get all the data for today
  day = timestamps.find((item) => {
    return item.date === today;
  });
  // console.log("day:\n", day);
  sendLog(
    "Processed data (" +
      day.date +
      "):\n```\n" +
      JSON.stringify(day, null, 2) +
      "\n```"
  );

  // Filter out the keys we want
  const filteredKeys = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  const filtered = Object.entries(day)
    .filter(([key]) => filteredKeys.includes(key))
    .map((item) => item[1]);
  // console.log("filtered:\n", filtered);

  // Convert to timestamp
  const converted = filtered.map((item) => {
    const iso = moment(day.date).format("YYYY-MM-DD");
    const dmIso = iso + " " + item;
    const momentParseIso = moment(dmIso).valueOf();
    return momentParseIso;
  });
  // console.log("converted:\n", converted);

  // Combine the keys and values
  const combined = filteredKeys.map((key, index) => {
    return { [key]: converted[index] };
  });
  // console.log("combined:\n", combined);

  // The updated data
  waktuSolat = combined;
  console.log("data processed\nwaktuSolat:\n", waktuSolat);
}

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

// Check if the last message was sent
let lastSent = false;

// Trigger lastSent to true
// This will prevent the bot from spamming the webhook
function triggerSent() {
  lastSent = true;
  console.log("Triggered lastSent to true");

  setTimeout(() => {
    // Reset lastSent to false after 1 minute
    lastSent = false;
  }, 1000 * 60 * 1);
}

// Test Data
const testWaktuSolat = [
  { fajr: 1671256100000 },
  { dhuhr: 1671256200000 },
  { asr: 1671256300000 },
  { maghrib: 1671256400000 },
  { isha: 1671256500000 },
];

if (DEBUG_MODE) {
  console.log("testWaktuSolat", testWaktuSolat);
  console.log("waktuSolat", waktuSolat);
}

// Check if the current time is within 1s of the timestamp
// If it is, prepare data and send to discord webhook
async function checkData() {
  const nowM = moment().valueOf();

  if (DEBUG_MODE) {
    await testWaktuSolat.forEach((el) => {
      const k = Object.keys(el)[0];
      const v = el[k];
      const check = nowM < v + 1000 && nowM > v - 1000;

      if (check) {
        if (lastSent) return console.log("Last sent", lastSent);
        triggerSent();
        prepareData(k);
        send();
      }
    });
  } else {
    await waktuSolat.forEach((el) => {
      const k = Object.keys(el)[0];
      const v = el[k];
      const check = nowM < v + 1000 && nowM > v - 1000;

      if (check) {
        if (lastSent) return;
        triggerSent();
        prepareData(k);
        send();
      }
    });
  }
}

async function sendLog(msg) {
  try {
    if (!LOG_WEBHOOK_URL) return;
    console.log("Sending log to discord...");
    const hook = LOG_WEBHOOK_URL;
    const data = {
      content: msg,
    };
    await fetch(hook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    console.log("Sent log to discord!");
  } catch (error) {
    return console.log(error);
  }
}

// Check every second
setInterval(() => {
  checkData();
}, 1000);

// Check data every hour
setInterval(() => {
  processData();
  sendLog("waktuSolat:\n", waktuSolat);
  console.log("waktuSolat:\n", waktuSolat);
}, 1000 * 60 * 60 * 1);

// Get updated data every day
setInterval(async () => {
  getUpdatedData();
  sendLog("data status: ", json.status, "\ndata serverTime: ", json.serverTime);
  console.log(
    "data status: ",
    json.status,
    "\ndata serverTime: ",
    json.serverTime
  );
}, 1000 * 60 * 60 * 24 * 1);

console.log("Bot is running...");

async function run() {
  await getUpdatedData();
  updateData();
  console.log(
    "data status: ",
    json.status,
    "\ndata serverTime: ",
    json.serverTime
  );
  await sendLog(`Latest update: <t:${moment(json.serverTime).format("X")}:R>`);
}

sendLog("Waktu Solat Bot is now online!");
run();
sendLog(`Current data update: <t:${moment(json.serverTime).format("X")}:R>`);
processData();
