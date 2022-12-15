const fs = require("fs");
const path = require("path");
const jsonPath = path.join(__dirname, "2022-solat.json");
const json = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

// const { WEBHOOK_URL } = require("./config.js");

const timestamps = json.prayerTime.map((item) => {
  return item;
});

// get all the dates in the timestamp

// const dates = timestamps.map((item) => {
//   return item.date;
// });
// console.log(dates);

// const sampleDate = "31-Dec-2022";
// const sampleTime = "05:48:00";
// console.log(sampleDate + " " + sampleTime);
// console.log(Date.parse(sampleDate + " " + sampleTime));

// get the timestamp for a specific date

const today = new Date()
  .toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  .split(" ")
  .join("-");
// console.log("today", today, Date.parse(today));

// const formattedDate = Date.now()
// const todayDate = today.getDate();
// const todayMonth = today.getMonth() + 1;
// const todayYear = today.getFullYear();

// const todayString = `${todayDate}-${todayMonth}-${todayYear}`;

// console.log(todayString);

const day = timestamps.find((item) => {
  return item.date === today;
});

// console.log(day);

// const dhuhrTimestamp = Date.parse(day.date + " " + day.dhuhr);
// console.log("dhuhr", dhuhrTimestamp);

// const now = Date.now();
// console.log("now", now);

// get time elapsed since dhuhr time

// const timeElapsed = now - dhuhrTimestamp;
// console.log("time elapsed", timeElapsed);

// const timeElapsed = now - dhuhrTimestamp;
// console.log("time elapsed", timeElapsed);

// convert time elapsed to hours, minutes and seconds
// const hours = Math.floor(timeElapsed / 1000 / 60 / 60);
// const minutes = Math.floor((timeElapsed / 1000 / 60 / 60 - hours) * 60);
// const seconds = Math.floor(
//   ((timeElapsed / 1000 / 60 / 60 - hours) * 60 - minutes) * 60
// );
// console.log(hours, minutes, seconds);

// put all content in day into an array
// console.log("day", day);
const filteredKeys = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const filtered = Object.entries(day)
  .filter(([key]) => filteredKeys.includes(key))
  .map((item) => item[1]);
// console.log("filtered", filtered);

const converted = filtered.map((item) => {
  const time = Date.parse(day.date + " " + item);
  return time;
});
// console.log("converted", converted);

const combined = filteredKeys.map((key, index) => {
  return { [key]: converted[index] };
});
// console.log("combined", combined);

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

async function send() {
  console.log("Sending to discord...");
  // send to discord webhook
  const hook = process.env.WEBHOOK_URL;
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

// const test = [
//   { one: 1671097150000 },
//   { two: 1671092950000 },
//   { three: 1671099340000 },
//   { four: 1671093920000 },
//   { five: 1671097550000 },
// ];

const waktuSolat = combined;
// console.log(waktuSolat);

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

setInterval(() => {
  checkData();
}, 1000);

console.log("Bot is running...");
