const { PrismaClient } = require("@prisma/client");
const path = require("path");
const fs = require("fs");

const prisma = new PrismaClient();

function loadSeedItems() {
  const seedPath = path.join(__dirname, "..", "src", "seed_items.json");
  const raw = fs.readFileSync(seedPath, "utf8");
  return JSON.parse(raw);
}

function buildBatchBItems(items) {
  return items.map((item, index) => {
    if (index === 0) {
      return {
        ...item,
        question: `${item.question} (Updated for batch B)`,
        expected_issue_tags: ["policy_unclear", ...(item.expected_issue_tags || [])],
      };
    }
    if (index === 1) {
      return {
        ...item,
        model_answer: `${item.model_answer} Additional caution: verify sources.`,
        expected_issue_tags: ["missing_citation", ...(item.expected_issue_tags || [])],
      };
    }
    return item;
  });
}

async function seed() {
  const baseItems = loadSeedItems();

  const batches = [
    { id: "batch_a", items: baseItems },
    { id: "batch_b", items: buildBatchBItems(baseItems) },
  ];

  for (const batch of batches) {
    await prisma.review.deleteMany({ where: { batch_id: batch.id } });
    await prisma.item.deleteMany({ where: { batch_id: batch.id } });

    const data = batch.items.map((item) => ({
      id: item.id,
      batch_id: batch.id,
      question: item.question,
      context: item.context,
      model_answer: item.model_answer,
      expected_risk: item.expected_risk,
      expected_issue_tags: item.expected_issue_tags ?? [],
    }));

    if (data.length > 0) {
      await prisma.item.createMany({ data });
    }
  }
}

seed()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seeded batch_a and batch_b.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
