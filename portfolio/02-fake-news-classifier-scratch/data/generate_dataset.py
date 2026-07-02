"""Generates a synthetic labeled headline dataset for this demo.

This is NOT a real-world news dataset — it's template-generated so the
project is self-contained and reproducible without downloading anything.
For production use, swap this file's output for a real labeled corpus
such as LIAR or FakeNewsNet (see README).
"""
import csv
import random
from pathlib import Path

random.seed(7)

CELEBRITIES = ["a famous actor", "a top athlete", "a pop star", "a tech billionaire", "a royal family member"]
CLAIMS = ["drinking lemon water", "a secret government chip", "5G towers", "a full moon", "eating one banana a day"]
AUTHORITIES = ["doctors", "banks", "the government", "big pharma", "airlines"]
AILMENTS = ["diabetes", "hair loss", "insomnia", "back pain", "memory loss"]
SECRETS = ["a massive data breach", "a hidden merger", "toxic waste dumping", "a secret lab", "insider trading"]
TOPICS = ["climate change", "the economy", "artificial intelligence", "vaccines", "cryptocurrency", "space travel"]
NUMBERS = [5, 7, 9, 10, 13, 21]
YEARS = [2027, 2028, 2030, 2035]

COUNTRIES = ["Japan", "Brazil", "Germany", "Kenya", "Canada", "India", "Egypt"]
INSTITUTIONS = ["Stanford University", "the Ministry of Health", "MIT", "the World Bank", "the local council"]
METRICS = ["exports", "unemployment", "tourism revenue", "renewable energy output", "literacy rates"]
QUARTERS = ["Q1", "Q2", "Q3", "the fiscal year"]
CITIES = ["Riyadh", "Cairo", "Toronto", "Berlin", "Nairobi", "Tokyo"]
FACILITIES = ["public library", "children's hospital", "research center", "metro line", "recycling plant"]
SPORTS_TEAMS = ["the national football team", "the city basketball club", "the university rowing team"]
COMPETITIONS = ["the regional championship", "the league final", "the qualifying round"]

FAKE_TEMPLATES = [
    "You won't believe what {celeb} did to {topic} last night",
    "SHOCKING: the {claim} secret that {authority} don't want you to know",
    "Scientists 'confirm' {claim} will destroy {topic} by {year}",
    "This one weird trick cures {ailment} instantly, doctors hate it",
    "BREAKING: {authority} caught hiding {secret} from the public",
    "{number} shocking facts about {topic} that will blow your mind",
    "Leaked memo 'proves' {authority} is behind {secret}",
    "Experts 'warn' {claim} could end {topic} as we know it",
]

REAL_TEMPLATES = [
    "{country} reports {number} percent change in {metric} for {quarter}",
    "{institution} announces new policy on {topic}",
    "Researchers at {institution} publish peer-reviewed study on {topic}",
    "{country} and neighboring country sign agreement on {topic}",
    "{institution} opens new {facility} in {city}",
    "{team} wins {competition} after a closely contested match",
    "City council in {city} approves budget for {facility} expansion",
    "{institution} releases annual report on {metric}",
]


def fill(template: str) -> str:
    return template.format(
        celeb=random.choice(CELEBRITIES),
        claim=random.choice(CLAIMS),
        authority=random.choice(AUTHORITIES),
        ailment=random.choice(AILMENTS),
        secret=random.choice(SECRETS),
        topic=random.choice(TOPICS),
        number=random.choice(NUMBERS),
        year=random.choice(YEARS),
        country=random.choice(COUNTRIES),
        institution=random.choice(INSTITUTIONS),
        metric=random.choice(METRICS),
        quarter=random.choice(QUARTERS),
        city=random.choice(CITIES),
        facility=random.choice(FACILITIES),
        team=random.choice(SPORTS_TEAMS),
        competition=random.choice(COMPETITIONS),
    )


def generate(n_per_class: int = 220):
    rows = []
    seen = set()
    while len([r for r in rows if r[1] == 1]) < n_per_class:
        text = fill(random.choice(FAKE_TEMPLATES))
        if text not in seen:
            seen.add(text)
            rows.append((text, 1))
    while len([r for r in rows if r[1] == 0]) < n_per_class:
        text = fill(random.choice(REAL_TEMPLATES))
        if text not in seen:
            seen.add(text)
            rows.append((text, 0))
    random.shuffle(rows)
    return rows


def main():
    rows = generate()
    out_path = Path(__file__).parent / "headlines.csv"
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["text", "label"])
        writer.writerows(rows)
    print(f"Wrote {len(rows)} rows to {out_path}")


if __name__ == "__main__":
    main()
