import express from "express";
import got from "got";
import { config } from "dotenv";

config();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

const app = express();

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect("index.html");
});

app.get("/auth", (req, res) => {
  res.redirect(
    "https://accounts.spotify.com/authorize" +
      `?client_id=${clientId}` +
      "&redirect_uri=http://localhost:3000/auth/callback" +
      "&response_type=code"
  );
});

app.get("/auth/callback", async (req, res) => {
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
          Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: new URLSearchParams({
        ["grant_type"]: "authorization_code",
        ["code"]: code,
        ["redirect_uri"]: "http://localhost:3000/auth/callback",
      }).toString(),
    });

    const accessToken = JSON.parse(response.body);
    res.send(accessToken);
  } catch (err) {
    res.send({ error: err.toString() });
  }
});

app.listen(3000, () => {
  console.log("App listening on http://localhost:3000");
});
