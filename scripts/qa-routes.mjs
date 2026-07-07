const routes = [
  "/",
  "/about-us/",
  "/blogs/",
  "/book-a-demo/",
  "/contact-us/",
  "/events/",
  "/lead-generation/",
  "/ai-conversations-one-voice-five-lanes-wide/",
  "/navigating-ai-mistrust-insights-and-solutions/",
  "/taking-steps-to-construct-trustworthy-ai/",
  "/people-coordinating-with-ai-sales-expertise/",
  "/marketvines-ai-and-expertise-transforming-b2b-growth/",
  "/the-demand-generation-wedding-why-product-management-is-never-in-charge-of-the-party/",
  "/94-2/",
];

const base = "http://localhost:3000";
let failed = 0;
for (const route of routes) {
  const res = await fetch(base + route);
  const ok = res.status === 200;
  if (!ok) {
    console.log("FAIL", route, res.status);
    failed++;
  } else {
    console.log("OK", route);
  }
}
console.log(failed ? `Failed: ${failed}` : "All routes OK");
