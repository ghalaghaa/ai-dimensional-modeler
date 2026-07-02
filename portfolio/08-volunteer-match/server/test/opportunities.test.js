import { test, describe } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../app.js";

describe("GET /api/opportunities", () => {
  test("returns the full seeded list", async () => {
    const app = createApp();
    const res = await request(app).get("/api/opportunities");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, 10);
  });

  test("filters by category (case-insensitive)", async () => {
    const app = createApp();
    const res = await request(app).get("/api/opportunities?category=animals");
    assert.equal(res.status, 200);
    assert.ok(res.body.length > 0);
    assert.ok(res.body.every((o) => o.category === "Animals"));
  });

  test("returns an empty array for a category with no matches", async () => {
    const app = createApp();
    const res = await request(app).get(
      "/api/opportunities?category=Nonexistent"
    );
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, []);
  });
});

describe("POST /api/opportunities", () => {
  test("creates a new opportunity and it shows up in the list", async () => {
    const app = createApp();
    const payload = {
      title: "Food Bank Sorting",
      organization: "City Food Bank",
      category: "Health",
      location: "Phoenix, AZ",
      date: "2026-09-01",
      spotsAvailable: 5,
      description: "Sort and pack donated food items for distribution.",
    };

    const createRes = await request(app)
      .post("/api/opportunities")
      .send(payload);

    assert.equal(createRes.status, 201);
    assert.equal(createRes.body.title, payload.title);
    assert.ok(createRes.body.id);

    const listRes = await request(app).get("/api/opportunities");
    assert.equal(listRes.body.length, 11);
    assert.ok(listRes.body.some((o) => o.title === "Food Bank Sorting"));
  });

  test("rejects a submission missing required fields", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/opportunities")
      .send({ title: "Missing everything else" });

    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });

  test("rejects an invalid category", async () => {
    const app = createApp();
    const res = await request(app).post("/api/opportunities").send({
      title: "Test",
      organization: "Test Org",
      category: "NotACategory",
      location: "Nowhere",
      date: "2026-09-01",
      spotsAvailable: 3,
    });

    assert.equal(res.status, 400);
  });
});

describe("POST /api/opportunities/:id/apply", () => {
  test("decrements spotsAvailable by 1", async () => {
    const app = createApp();
    const before = await request(app).get("/api/opportunities/1");
    const startingSpots = before.body.spotsAvailable;

    const res = await request(app).post("/api/opportunities/1/apply");

    assert.equal(res.status, 200);
    assert.equal(res.body.spotsAvailable, startingSpots - 1);
  });

  test("returns 400 when no spots are left", async () => {
    const app = createApp();
    // Opportunity id 6 is seeded with spotsAvailable: 0
    const res = await request(app).post("/api/opportunities/6/apply");

    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });

  test("returns 404 for an unknown opportunity id", async () => {
    const app = createApp();
    const res = await request(app).post("/api/opportunities/9999/apply");
    assert.equal(res.status, 404);
  });

  test("applying repeatedly eventually hits the 400 once spots run out", async () => {
    const app = createApp();
    // Opportunity id 3 starts with 4 spots
    for (let i = 0; i < 4; i++) {
      const res = await request(app).post("/api/opportunities/3/apply");
      assert.equal(res.status, 200);
    }
    const finalRes = await request(app).post("/api/opportunities/3/apply");
    assert.equal(finalRes.status, 400);
  });
});
