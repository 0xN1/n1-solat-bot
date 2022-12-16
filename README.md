# Waktu Solat Bot

![](https://cdn.discordapp.com/attachments/864386510199717898/1053230541186539550/image.png)

This is a simple bot to send waktu solat data to discord through webhook. It will automatically post the message at solat time.

---

## Installation

Install packages

```
npm install
yarn
```

Create a .env file and enter your Discord Webhook URL

```
DISCORD_WEBHOOK_URL=YOUR_DISCORD_WEBHOOK
```

Spin up dev server

```
npm run dev
yarn dev
```

## Deploy

Run locally

```
npm run start
yarn start
```

Or you could deploy on Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/FFDan2?referralCode=TnUgAY)

Set the Discord Webhook URL in the environment variables

## Data source

Yearly data from [e-solat](https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=year&zone=WLY01)

## Future

- Option to easily change the zone

## Thanks

Thank you, feel free to contribute. :)
