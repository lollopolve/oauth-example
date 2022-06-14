import fs from "fs";
import jwt from "jsonwebtoken";

export function generateJwt(clientId, teamId, keyId, keyPath) {
  const privateKey = fs.readFileSync(keyPath);

  const iat = new Date();
  const exp = new Date(iat);
  exp.setHours(iat.getHours() + 1);

  const header = {
    alg: "ES256",
    typ: "JWT",
    kid: keyId,
  };

  const payload = {
    iss: teamId,
    iat: Math.floor(iat.getTime() / 1000),
    exp: Math.floor(exp.getTime() / 1000),
	aud: "https://appleid.apple.com",
    sub: clientId,
  };

  return jwt.sign(payload, privateKey, {
    algorithm: header.alg,
    header: header,
  });
}