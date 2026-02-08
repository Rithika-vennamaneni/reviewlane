-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "model_answer" TEXT NOT NULL,
    "expected_risk" TEXT NOT NULL,
    "expected_issue_tags" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "item_id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "confidence" TEXT NOT NULL,
    "reason_tags" JSONB NOT NULL,
    "edited_text" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_item_id_batch_id_fkey" FOREIGN KEY ("item_id", "batch_id") REFERENCES "Item" ("id", "batch_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Item_batch_id_idx" ON "Item"("batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "Item_id_batch_id_key" ON "Item"("id", "batch_id");

-- CreateIndex
CREATE INDEX "Review_batch_id_idx" ON "Review"("batch_id");

-- CreateIndex
CREATE INDEX "Review_item_id_idx" ON "Review"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "Review_item_id_batch_id_reviewer_id_key" ON "Review"("item_id", "batch_id", "reviewer_id");
