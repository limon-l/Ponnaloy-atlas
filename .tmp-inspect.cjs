const fs = require("fs");
const s = fs.readFileSync("src/lib/seed.ts", "utf8");
const seg = s.slice(s.indexOf("export const products"), s.indexOf("export const collections"));
const blocks = seg.split(/\n  makeProduct\(\{/).slice(1);
for (const block of blocks) {
  const id = /id: "([^"]+)"/.exec(block)?.[1];
  const name = /name: "([^"]+)"/.exec(block)?.[1];
  const price = /price: (\d+)/.exec(block)?.[1];
  const moderation = /moderation: "([^"]+)"/.exec(block)?.[1];
  if (id) console.log(id, "|", name, "|", price, "|", moderation);
}
