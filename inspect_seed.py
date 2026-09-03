import json
from collections import Counter


REFERENCE_FILE = "seed_data/reference.json"
SEED_FILE = "seed_data/seed_shows.json"


with open(REFERENCE_FILE, encoding="utf-8") as f:
    reference = json.load(f)

with open(SEED_FILE, encoding="utf-8") as f:
    records = json.load(f)


allowed_sections = set(reference["sections"])
allowed_categories = set(reference["categories"])
allowed_languages = set(reference["languages"])

print("=" * 60)
print("PEBLO TV SEED DATA INSPECTION")
print("=" * 60)

print(f"Total records: {len(records)}")
print(f"Total shows: {len(set(r['slug'] for r in records))}")

print("\nAllowed sections:")
print(sorted(allowed_sections))

print("\nAllowed languages:")
print(sorted(allowed_languages))


# ---------------------------------------------------------
# 1. Missing fields
# ---------------------------------------------------------

required_fields = [
    "episode_id",
    "show_title",
    "slug",
    "section",
    "categories",
    "synopsis",
    "season_number",
    "episode_number",
    "episode_title",
    "duration_seconds",
    "language",
    "content_group",
    "status",
    "artwork_available",
]

print("\n" + "=" * 60)
print("1. MISSING REQUIRED FIELDS")
print("=" * 60)

found = False

for record in records:
    missing = [
        field
        for field in required_fields
        if field not in record or record[field] is None
    ]

    if missing:
        found = True
        print(record.get("episode_id"), "->", missing)

if not found:
    print("None")


# ---------------------------------------------------------
# 2. Invalid sections
# ---------------------------------------------------------

print("\n" + "=" * 60)
print("2. INVALID SECTIONS")
print("=" * 60)

found = False

for record in records:
    section = record.get("section")

    if section not in allowed_sections:
        found = True
        print(
            record.get("episode_id"),
            "->",
            repr(section)
        )

if not found:
    print("None")


# ---------------------------------------------------------
# 3. Invalid languages
# ---------------------------------------------------------

print("\n" + "=" * 60)
print("3. INVALID LANGUAGES")
print("=" * 60)

found = False

for record in records:
    language = record.get("language")

    if language not in allowed_languages:
        found = True
        print(
            record.get("episode_id"),
            "->",
            repr(language)
        )

if not found:
    print("None")


# ---------------------------------------------------------
# 4. Invalid categories
# ---------------------------------------------------------

print("\n" + "=" * 60)
print("4. INVALID CATEGORIES")
print("=" * 60)

found = False

for record in records:
    categories = record.get("categories") or []

    invalid = [
        category
        for category in categories
        if category not in allowed_categories
    ]

    if invalid:
        found = True
        print(
            record.get("episode_id"),
            "->",
            invalid
        )

if not found:
    print("None")


# ---------------------------------------------------------
# 5. Invalid duration
# ---------------------------------------------------------

print("\n" + "=" * 60)
print("5. INVALID DURATION")
print("=" * 60)

found = False

for record in records:
    duration = record.get("duration_seconds")

    if not isinstance(duration, int) or duration <= 0:
        found = True
        print(
            record.get("episode_id"),
            "->",
            repr(duration)
        )

if not found:
    print("None")


# ---------------------------------------------------------
# 6. Artwork
# ---------------------------------------------------------

print("\n" + "=" * 60)
print("6. MISSING / INCOMPLETE ARTWORK")
print("=" * 60)

required_artwork = {"poster", "banner", "thumbnail"}

found = False

for record in records:
    artwork = set(record.get("artwork_available") or [])

    missing = required_artwork - artwork

    if missing:
        found = True
        print(
            record.get("episode_id"),
            "-> missing:",
            sorted(missing)
        )

if not found:
    print("None")


# ---------------------------------------------------------
# 7. Season 0
# ---------------------------------------------------------

print("\n" + "=" * 60)
print("7. SEASON 0 RECORDS")
print("=" * 60)

found = False

for record in records:
    if record.get("season_number") == 0:
        found = True
        print(
            record.get("episode_id"),
            "->",
            record.get("episode_title")
        )

if not found:
    print("None")


# ---------------------------------------------------------
# 8. Duplicate content_group + language
# ---------------------------------------------------------

print("\n" + "=" * 60)
print("8. DUPLICATE (content_group, language)")
print("=" * 60)

pairs = Counter(
    (
        record.get("content_group"),
        record.get("language"),
    )
    for record in records
)

duplicates = {
    pair: count
    for pair, count in pairs.items()
    if count > 1
}

if duplicates:
    for pair, count in duplicates.items():
        print(pair, "->", count, "records")
else:
    print("None")


# ---------------------------------------------------------
# 9. Duplicate episode IDs
# ---------------------------------------------------------

print("\n" + "=" * 60)
print("9. DUPLICATE EPISODE IDs")
print("=" * 60)

episode_ids = Counter(
    record.get("episode_id")
    for record in records
)

duplicates = {
    episode_id: count
    for episode_id, count in episode_ids.items()
    if count > 1
}

if duplicates:
    for episode_id, count in duplicates.items():
        print(episode_id, "->", count)
else:
    print("None")


# ---------------------------------------------------------
# 10. Statuses
# ---------------------------------------------------------

print("\n" + "=" * 60)
print("10. STATUSES")
print("=" * 60)

statuses = Counter(record.get("status") for record in records)

for status, count in statuses.items():
    print(repr(status), "->", count)


print("\n" + "=" * 60)
print("INSPECTION COMPLETE")
print("=" * 60)