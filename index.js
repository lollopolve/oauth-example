import express from "express";
import got from "got";
import { config } from "dotenv";
import * as apple from "./apple.js";

config();

const baseUrl = process.env.BASE_URL ?? "http://localhost:8080";

const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;

const appleClientId = process.env.APPLE_CLIENT_ID;
const appleTeamId = process.env.APPLE_TEAM_ID;
const appleKeyId = process.env.APPLE_KEY_ID;
const appleKeyPath = process.env.APPLE_KEY_PATH;

const app = express();

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect("index.html");
});

app.get("/spotify/auth", (req, res) => {
  res.redirect(
    "https://accounts.spotify.com/authorize" +
      `?client_id=${spotifyClientId}` +
      `&redirect_uri=${baseUrl}/spotify/auth/callback` +
      "&response_type=code"
  );
});

app.get("/spotify/auth/callback", async (req, res) => {
  const code = req.query.code;
  if (typeof code !== "string") {
    res.send({ error: "Invalid code" });
  }

  try {
    const response = await got("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${spotifyClientId}:${spotifyClientSecret}`).toString(
            "base64"
          ),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: `${baseUrl}/spotify/auth/callback`,
      }).toString(),
    });

    const accessToken = JSON.parse(response.body);
    res.send(accessToken);
  } catch (err) {
    res.send({ error: err.toString() });
  }
});

app.get("/apple/auth", async (req, res) => {
  res.redirect(
    "https://appleid.apple.com/auth/authorize" +
      `?client_id=${appleClientId}` +
      `&redirect_uri=${baseUrl}/apple/auth/callback` +
      "&response_type=code"
  );
});

app.get("/apple/auth/callback", async (req, res) => {
  const code = req.query.code;
  if (typeof code !== "string") {
    res.send({ error: "Invalid code" });
  }

  try {
    const jwt = apple.generateJwt(appleClientId, appleTeamId, appleKeyId, appleKeyPath);
    const response = await got("https://appleid.apple.com/auth/token", {
      method: "POST",
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: appleClientId,
        client_secret: jwt,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: `${baseUrl}/apple/auth/callback`,
      }).toString(),
    });

    const accessToken = JSON.parse(response.body);
    res.send(accessToken);
  } catch (e) {
    res.send({ error: e.toString() });
  }
});

app.listen(8080, () => {
  console.log("App listening on http://localhost:8080");
});
