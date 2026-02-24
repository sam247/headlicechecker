# Content Governance Checklist

Publication is blocked unless each page has:

1. `primaryKeyword`
2. `secondaryKeywords` (3-5)
3. `intentType` (`informational`, `commercial`, or `mixed`)
4. `funnelStage` (`panic`, `evaluation`, or `decision`)
5. Internal links:
- 1 `hub` link
- 2 `sibling` links
- 1 `conversion` link
- 1 `tool` link in first content screen
6. FAQ schema-ready FAQ entries
7. Standard escalation model text:
- `Detection -> Confidence -> Monitor -> Recheck -> Professional Confirmation -> Urgent Medical Review (if symptoms escalate)`
8. Non-duplicated sibling H2 patterns
9. Non-duplicated sibling FAQ prompts
10. Paragraph-dominant composition target and minimum 1,500 words

Enforced by:
- `lib/data/content-governance.ts`
- `lib/data/content-pages.ts`
