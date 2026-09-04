import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the MYNORA home page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>MYNORA Bakery \| Bánh làm theo đơn tại Đà Nẵng<\/title>/i);
  assert.match(html, /BÁNH LÀM MỚI THEO ĐƠN/);
  assert.match(html, /Một chút ngọt ngào,/);
  assert.match(html, /Làm chậm một chút,/);
  assert.match(html, /Bạn đã chọn được món bánh<br\/><em>hôm nay chưa\?<\/em>/);
});

test("renders all eight image-backed product cards with their real routes", async () => {
  const response = await render();
  const html = await response.text();
  const products = [
    ["coconut-flan", "Flan Dừa Mây"],
    ["gateau-coconut-flan", "Gâteau Dừa Caramel"],
    ["su-kem", "Su Kem Mây"],
    ["brownies", "Brownie Nâu Đậm"],
    ["basque-burnt-cheesecake", "Basque Cháy Mịn"],
    ["crepe", "Crêpe Kem Mây"],
    ["cookie-hanh-nhan-chocolate-chip", "Navy Chip Cookie"],
    ["tiramisu", "Tiramisu Đêm Xanh"],
  ];

  for (const [slug, name] of products) {
    assert.match(html, new RegExp(`href="/san-pham/${slug}"`));
    assert.match(html, new RegExp(`src="/images/products/${slug}\\.jpg"`));
    assert.match(html, new RegExp(name));
  }
});
