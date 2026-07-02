import express from "express";
import cors from "cors";
import { createSeedOpportunities } from "./data.js";

const VALID_CATEGORIES = ["Education", "Environment", "Health", "Animals"];

/**
 * Builds a fresh Express app instance with its own isolated in-memory
 * opportunities list. Used both by the running server (index.js) and by
 * the test suite, so tests never share mutable state with each other.
 */
export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  let opportunities = createSeedOpportunities();
  let nextId = opportunities.length + 1;

  app.get("/api/opportunities", (req, res) => {
    const { category } = req.query;
    if (category) {
      return res.json(
        opportunities.filter(
          (o) => o.category.toLowerCase() === String(category).toLowerCase()
        )
      );
    }
    res.json(opportunities);
  });

  app.get("/api/opportunities/:id", (req, res) => {
    const opportunity = opportunities.find(
      (o) => o.id === Number(req.params.id)
    );
    if (!opportunity) {
      return res.status(404).json({ error: "Opportunity not found" });
    }
    res.json(opportunity);
  });

  app.post("/api/opportunities", (req, res) => {
    const { title, organization, category, location, date, description } =
      req.body ?? {};
    let { spotsAvailable } = req.body ?? {};

    if (!title || !organization || !category || !location || !date) {
      return res.status(400).json({
        error:
          "title, organization, category, location, and date are required",
      });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        error: `category must be one of: ${VALID_CATEGORIES.join(", ")}`,
      });
    }

    spotsAvailable = Number(spotsAvailable);
    if (!Number.isFinite(spotsAvailable) || spotsAvailable < 0) {
      spotsAvailable = 0;
    }

    const newOpportunity = {
      id: nextId++,
      title,
      organization,
      category,
      location,
      date,
      spotsAvailable,
      description: description ?? "",
    };

    opportunities.push(newOpportunity);
    res.status(201).json(newOpportunity);
  });

  app.post("/api/opportunities/:id/apply", (req, res) => {
    const opportunity = opportunities.find(
      (o) => o.id === Number(req.params.id)
    );
    if (!opportunity) {
      return res.status(404).json({ error: "Opportunity not found" });
    }
    if (opportunity.spotsAvailable <= 0) {
      return res.status(400).json({ error: "No spots available" });
    }
    opportunity.spotsAvailable -= 1;
    res.json(opportunity);
  });

  return app;
}
