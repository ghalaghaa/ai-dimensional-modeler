// Seed data for volunteer opportunities.
// createSeedOpportunities() returns a fresh deep copy each time it's called,
// so the Express app (and each test) can hold its own isolated in-memory list.

const seed = [
  {
    id: 1,
    title: "After-School Reading Buddies",
    organization: "Bright Futures Literacy Project",
    category: "Education",
    location: "Portland, OR",
    date: "2026-08-05",
    spotsAvailable: 6,
    description:
      "Pair up with elementary school students for weekly one-on-one reading sessions to build literacy and confidence.",
  },
  {
    id: 2,
    title: "Community Garden Cleanup",
    organization: "Green City Coalition",
    category: "Environment",
    location: "Austin, TX",
    date: "2026-07-19",
    spotsAvailable: 15,
    description:
      "Help weed, mulch, and plant native species in our neighborhood community garden. Tools and gloves provided.",
  },
  {
    id: 3,
    title: "Blood Pressure Screening Drive",
    organization: "Riverside Community Health Center",
    category: "Health",
    location: "Chicago, IL",
    date: "2026-07-26",
    spotsAvailable: 4,
    description:
      "Assist licensed nurses with a free public blood pressure and wellness screening event at the farmers market.",
  },
  {
    id: 4,
    title: "Shelter Dog Walking",
    organization: "Second Chance Animal Rescue",
    category: "Animals",
    location: "Denver, CO",
    date: "2026-07-12",
    spotsAvailable: 8,
    description:
      "Walk and socialize shelter dogs to keep them active and improve their chances of adoption.",
  },
  {
    id: 5,
    title: "STEM Mentorship Workshop",
    organization: "CodeNext Youth Alliance",
    category: "Education",
    location: "Remote",
    date: "2026-08-15",
    spotsAvailable: 10,
    description:
      "Lead a beginner-friendly coding workshop for high school students interested in computer science careers.",
  },
  {
    id: 6,
    title: "Beach & Coastline Cleanup",
    organization: "Ocean Guardians Network",
    category: "Environment",
    location: "San Diego, CA",
    date: "2026-07-20",
    spotsAvailable: 0,
    description:
      "Join a large-scale cleanup to remove plastic and debris from our local coastline before peak summer season.",
  },
  {
    id: 7,
    title: "Meal Delivery for Seniors",
    organization: "Golden Years Support Network",
    category: "Health",
    location: "Boston, MA",
    date: "2026-07-09",
    spotsAvailable: 12,
    description:
      "Deliver hot meals and check in on homebound seniors in your neighborhood once a week.",
  },
  {
    id: 8,
    title: "Wildlife Rescue Center Support",
    organization: "Foothills Wildlife Sanctuary",
    category: "Animals",
    location: "Boulder, CO",
    date: "2026-08-02",
    spotsAvailable: 5,
    description:
      "Help feed, clean enclosures, and prepare rehabilitated wildlife for release back into the wild.",
  },
  {
    id: 9,
    title: "Adult Literacy Tutoring",
    organization: "Bright Futures Literacy Project",
    category: "Education",
    location: "Miami, FL",
    date: "2026-08-22",
    spotsAvailable: 7,
    description:
      "Tutor adult learners working toward their GED or improving their English reading and writing skills.",
  },
  {
    id: 10,
    title: "Urban Tree Planting Day",
    organization: "Green City Coalition",
    category: "Environment",
    location: "Seattle, WA",
    date: "2026-07-30",
    spotsAvailable: 20,
    description:
      "Plant trees along neglected urban streets to expand the city's canopy and reduce heat island effect.",
  },
];

export function createSeedOpportunities() {
  return seed.map((opportunity) => ({ ...opportunity }));
}
