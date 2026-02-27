#!/usr/bin/env node
/**
 * Merge generated posts with existing featured posts.
 * Keeps: head-lice-treatment-for-adults, what-are-the-first-signs-of-head-lice, best-over-the-counter-head-lice-treatment-for-sensitive-skin
 * Replaces the rest with generated content.
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const KEEP_SLUGS = new Set([
  "head-lice-treatment-for-adults",
  "what-are-the-first-signs-of-head-lice",
  "best-over-the-counter-head-lice-treatment-for-sensitive-skin",
]);

const postsPath = resolve(process.cwd(), "content/blog/posts.json");
const generatedPath = resolve(process.cwd(), "scripts/generated-posts.json");

const allPosts = JSON.parse(readFileSync(postsPath, "utf-8"));
const generated = JSON.parse(readFileSync(generatedPath, "utf-8"));

const kept = allPosts.filter((p) => KEEP_SLUGS.has(p.slug));
const merged = [...kept, ...generated];

writeFileSync(postsPath, JSON.stringify(merged, null, 2));
console.log(`Merged: ${kept.length} kept + ${generated.length} generated = ${merged.length} total`);
