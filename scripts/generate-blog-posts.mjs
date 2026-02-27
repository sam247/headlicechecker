#!/usr/bin/env node
/**
 * Generate blog posts from parsed CSV topics.
 * Reads /tmp/blog-topics.json and outputs new posts to append to posts.json.
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const topicsPath = "/tmp/blog-topics.json";
const topics = JSON.parse(readFileSync(topicsPath, "utf-8"));

const CATEGORIES = ["Treatment", "Parents", "Adults", "Prevention", "FAQs", "School"];
const today = "2026-02-21";

function pickCategory(slug) {
  if (slug.includes("school") || slug.includes("child") || slug.includes("parent")) return "Parents";
  if (slug.includes("treatment") || slug.includes("remed") || slug.includes("permethrin") || slug.includes("chemical")) return "Treatment";
  if (slug.includes("prevent") || slug.includes("spread") || slug.includes("5-tips")) return "Prevention";
  if (slug.includes("adult") || slug.includes("bald") || slug.includes("blonde") || slug.includes("curly")) return "Adults";
  if (slug.includes("question") || slug.includes("myth") || slug.includes("can-") || slug.includes("does-") || slug.includes("what-") || slug.includes("how-")) return "FAQs";
  if (slug.includes("school") || slug.includes("term")) return "School";
  return "FAQs";
}

function slugToKeywords(slug) {
  const words = slug.split("-").filter((w) => w.length > 2 && !["the", "and", "for", "are", "can", "how", "what", "why", "does", "with"].includes(w));
  return [...new Set([...words.slice(0, 4), "head lice", "nits"])].slice(0, 6);
}

// Content templates per topic - each returns body array
const contentMap = {
  "will-hair-colour-kill-head-lice": () => [
    "## TL;DR",
    "Sorry to disappoint — hair dye won't reliably kill head lice. The ammonia and peroxide in colour treatments aren't designed for lice, and nits are especially tough. Stick to silicone- or oil-based products or wet combing.",
    "## Do head lice survive hair colouring?",
    "Lice live right at the scalp, feeding on blood. Hair dye can irritate your skin, but it doesn't consistently kill the bugs or their eggs. Some might die; many don't. It's a gamble, and not one worth taking.",
    "If you've got lice, skip the colour theory and go straight to what works: a silicone lotion, thorough wet combing, or a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic visit</a>. Not sure if it's lice? Snap a photo and try our <a href=\"/\" class=\"text-primary hover:underline\">checker</a> — it'll give you an indicative result before you treat.",
    "## What actually works for head lice?",
    "Suffocation (silicone or oil) or physical removal (wet combing) — neither relies on chemicals lice might shrug off. For more on treatment options, see our <a href=\"/blog/head-lice-treatment-for-adults\" class=\"text-primary hover:underline\">full treatment guide</a>.",
  ],
  "why-you-shouldnt-use-permethrin-as-a-head-lice-treatment": () => [
    "## TL;DR",
    "Permethrin used to be the go-to — not anymore. Lice have evolved resistance in many areas, and there are better options. Silicone- or oil-based treatments and wet combing are safer and often work when permethrin doesn't.",
    "## What is permethrin?",
    "It's a synthetic insecticide that targets the louse nervous system. Worked great for years. The problem? Lice populations have adapted. In lots of places, it simply doesn't clear infestations anymore.",
    "## Why avoid permethrin for head lice?",
    "You're putting pesticide on your (or your child's) scalp for something that might not even work. Health bodies now favour non-insecticide options: silicone lotions, wet combing, or a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">professional removal</a>. If you're weighing up options, our <a href=\"/blog/how-to-choose-the-best-head-lice-treatment\" class=\"text-primary hover:underline\">treatment comparison</a> might help.",
  ],
  "where-do-head-lice-live": () => [
    "## TL;DR",
    "Only on human scalps. They can't survive on pets, sofas, or bedding for more than a day or two. Spread happens when heads touch — not from the environment.",
    "## Where do head lice like to live?",
    "Warm spots close to the scalp: behind the ears, at the nape, around the crown. They need blood to survive. Off the head, they're dead within 24–48 hours.",
    "## Can head lice live on pillows?",
    "Briefly, maybe — but they can't feed or breed there. Washing bedding is sensible, but it won't stop an outbreak. The real fix: treat everyone with lice and cut down on head-to-head contact. Wondering if you've got them? Our <a href=\"/\" class=\"text-primary hover:underline\">photo checker</a> can give you an indicative result. For more on spread, see <a href=\"/blog/can-head-lice-live-on-bedding\" class=\"text-primary hover:underline\">our bedding article</a>.",
  ],
  "what-to-do-if-your-childs-friend-has-lice": () => [
    "## TL;DR",
    "Don't panic. Check your child's hair with a fine comb. Treat only if you find live lice. Give the friend's parents a heads-up (discreetly). Keep heads apart until both kids are clear.",
    "## What do you do if you've been around someone with head lice?",
    "Wet comb — conditioner, fine comb, good light. Work through the hair from roots to ends and wipe the comb on a tissue. Spot one live louse? That's your answer: treat.",
    "## How long can you have head lice without noticing?",
    "Itching can take 2–4 weeks to kick in. Some people never itch at all. That's why checks after sleepovers or close play matter. Not sure what you're looking for? Try our <a href=\"/\" class=\"text-primary hover:underline\">checker</a> for an indicative result, or read up on <a href=\"/blog/what-are-the-first-signs-of-head-lice\" class=\"text-primary hover:underline\">first signs</a>.",
  ],
  "what-happens-if-you-leave-head-lice-untreated": () => [
    "## TL;DR",
    "They multiply. Itching gets worse. The infestation spreads. In rare cases, scratching can open the door to skin infection. Treat early — it's easier and stops the cycle.",
    "## Untreated head lice complications",
    "Female lice lay eggs every day. A small problem becomes a big one fast. The itching ramps up; scratching can cause sores or secondary infection. And everyone in close contact is at risk.",
    "## Why treat promptly?",
    "The sooner you act, the simpler it is. Silicone- or oil-based products or wet combing, then repeat after 7–10 days. Stuck? A <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a> can help. For a step-by-step, see our <a href=\"/blog/head-lice-treatment-for-adults\" class=\"text-primary hover:underline\">treatment guide</a>.",
  ],
  "what-are-super-lice": () => [
    "## TL;DR",
    "\"Super lice\" is just a nickname for lice that shrug off permethrin and similar insecticides. They look exactly like regular lice. Good news: silicone- or oil-based treatments and wet combing still work — they don't rely on chemicals.",
    "## What are super lice?",
    "Same species, different response to pesticides. They've evolved. They're not bigger or faster; they're just unfazed by the old insecticide products. Read more on <a href=\"/blog/why-you-shouldnt-use-permethrin-as-a-head-lice-treatment\" class=\"text-primary hover:underline\">why we avoid permethrin</a>.",
    "## Do they look different to lice?",
    "Nope. Identical. The only difference is how they respond to treatment. Physical methods — suffocation or combing — don't care about resistance. Before you treat, worth <a href=\"/\" class=\"text-primary hover:underline\">checking</a> you've actually got them.",
  ],
  "how-to-get-rid-of-nits-what-you-need-to-know": () => [
    "## TL;DR",
    "Nits are eggs. Treat with a silicone- or oil-based product, comb daily with a fine metal comb for 7–10 days, and repeat after a week. Dead nits might hang on but won't hatch.",
    "## Will dead nits fall out eventually?",
    "Yes. Hair grows, and empty casings move away from the scalp. They'll fall out or comb away. Harmless once the lice inside are gone.",
    "## Do lice eventually die off?",
    "Off the scalp, they're dead in 1–2 days. On it, they live about 30 days and keep laying. Break the cycle: kill live lice, loosen eggs, repeat. Full walkthrough in our <a href=\"/blog/head-lice-treatment-for-adults\" class=\"text-primary hover:underline\">treatment guide</a>. For nit facts, see <a href=\"/blog/facts-about-nits-what-you-need-to-know-about-head-lice-eggs\" class=\"text-primary hover:underline\">facts about nits</a>.",
  ],
  "home-remedies-for-head-lice-do-they-work": () => [
    "## TL;DR",
    "Mayo, coconut oil, olive oil — they can suffocate some lice, but it's hit and miss. Wet combing is the most reliable chemical-free option. Skip the kerosene and other dodgy ideas.",
    "## Do home remedies work for head lice?",
    "Thick stuff can block breathing pores. Problem is, it's inconsistent. Silicone-based products are built for this. Wet combing — conditioner plus a fine comb — actually works and costs almost nothing.",
    "## Safe home approaches",
    "If you want to go natural: conditioner, sections, comb every few days for two weeks. Pair it with a silicone or oil product for better odds. Still stuck? A <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a> can clear it. Or try our <a href=\"/blog/non-chemical-head-lice-treatment\" class=\"text-primary hover:underline\">non-chemical treatment</a> guide.",
  ],
  "non-chemical-head-lice-treatment": () => [
    "## TL;DR",
    "Wet combing, silicone lotions, oil-based products — no insecticides. They work by suffocation or physical removal. Safe for kids and sensitive skin.",
    "## Are non-chemical treatments effective?",
    "Yes. Health bodies recommend them. No pesticide resistance to worry about, and they're gentler. See <a href=\"/blog/why-you-shouldnt-use-permethrin-as-a-head-lice-treatment\" class=\"text-primary hover:underline\">why we steer clear of permethrin</a>.",
    "## Hand clearing tips",
    "Loads of conditioner, good light, fine metal comb. Small sections, roots to ends. Every few days for at least two weeks. Want someone else to do it? Our <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic finder</a> lists local options. Not sure it's lice? <a href=\"/\" class=\"text-primary hover:underline\">Check first</a>.",
  ],
  "how-to-treat-head-lice-effectively": () => [
    "## TL;DR",
    "Confirm with a wet comb. Use silicone- or oil-based product or wet combing. Repeat after 7–10 days. Comb daily. Treat everyone in the household at once.",
    "## How to get rid of nits and lice",
    "Apply to dry hair, leave as directed, rinse, comb. Repeat the product a week later. Comb daily to clear eggs and catch stragglers. More detail in our <a href=\"/blog/head-lice-treatment-for-adults\" class=\"text-primary hover:underline\">treatment guide</a>.",
    "## What methods work best?",
    "Silicone lotions and wet combing. Skip the old insecticide stuff — resistance is rife. Before you start, <a href=\"/\" class=\"text-primary hover:underline\">confirm</a> you've actually got lice. Choosing products? <a href=\"/blog/how-to-choose-the-best-head-lice-treatment\" class=\"text-primary hover:underline\">Here's how</a>.",
  ],
  "what-does-lice-in-blonde-hair-look-like": () => [
    "## TL;DR",
    "Lice and nits in blonde hair look the same as in dark hair: adult lice are tan or grey, about 2–3mm long; nits are oval, yellowish-white, and glued near the roots. They can be harder to spot in blonde hair because nits blend in — use good lighting and a fine comb.",
    "## Spotting lice in blonde hair",
    "Adult head lice are small, wingless insects that crawl close to the scalp. In blonde hair, they may appear lighter or more translucent. Nits (eggs) are often pale yellow or white and can blend with blonde strands. Part the hair in sections and comb with a fine-toothed comb under bright light.",
    "## What to do if you find them",
    "Treat with a silicone- or oil-based product or wet combing. Repeat after 7–10 days. If you're unsure whether you have lice, use our free <a href=\"/\" class=\"text-primary hover:underline\">head lice checker</a> for an indicative result. For professional removal, find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a> near you.",
  ],
  "what-could-itchy-bumps-on-the-scalp-mean": () => [
    "## TL;DR",
    "Itchy bumps on the scalp can mean head lice, folliculitis, eczema, contact dermatitis, or other conditions. Check for lice first with a wet comb — it's quick and non-invasive.",
    "## Itchy bumps could be head lice",
    "Head lice cause itching when they bite the scalp. Bumps may appear behind the ears or at the nape of the neck. Use the wet combing method to confirm: conditioner, fine comb, good light. One live louse means treatment is needed.",
    "## Other causes: folliculitis and eczema",
    "Folliculitis is inflammation of hair follicles, often from bacteria or friction. Eczema can cause dry, itchy patches. If you rule out lice with a thorough comb check, see a GP or pharmacist for other causes. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a> for an indicative result before treating.",
  ],
  "what-can-cause-a-rash-on-the-hairline": () => [
    "## TL;DR",
    "A rash on the hairline can be caused by head lice, contact dermatitis, eczema, or product buildup. Check for lice first with a wet comb — it's the most common cause in children.",
    "## Check for lice",
    "Head lice often cause redness and irritation along the hairline, especially behind the ears and at the nape. Use conditioner and a fine comb to check. Wipe the comb on a tissue and look for lice or eggs.",
    "## How to check for lice",
    "Wash and condition hair, leave it damp, then comb from roots to ends in small sections. Good lighting helps. If you find live lice, treat with a silicone- or oil-based product and repeat after 7–10 days. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a> for an indicative result. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a> for professional help.",
  ],
  "untreated-head-lice": () => [
    "## TL;DR",
    "Leaving head lice untreated lets them multiply. Itching worsens, the infestation spreads to family and contacts, and scratching can cause skin infection. Treat early with silicone- or oil-based products or wet combing.",
    "## Untreated head lice – what happens?",
    "Female lice lay several eggs a day. Without treatment, a small infestation grows quickly. Itching may increase, and constant scratching can lead to sores or secondary bacterial infection. Lice also spread to others through head-to-head contact.",
    "## Do lice need to mate to lay eggs?",
    "A single fertilised female can lay viable eggs. That's why one louse can start a new infestation. Treat everyone with confirmed lice at the same time. Repeat treatment after 7–10 days. For stubborn cases, see a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">professional clinic</a>.",
  ],
  "the-top-25-questions-our-clients-ask-about-head-lice": () => [
    "## TL;DR",
    "Parents and carers often ask why products fail, why lice keep coming back, and how to prevent spread. The answers: resistance to old insecticides, missed eggs or reinfestation, and treating everyone at once.",
    "## Why don't the products work?",
    "Many over-the-counter products use permethrin or similar insecticides. Head lice have developed resistance in many areas. Switch to silicone- or oil-based products or wet combing — they work by suffocation or physical removal, not chemicals.",
    "## Why does my child keep getting lice?",
    "Usually it's reinfestation: someone in the household still has lice, or a friend at school does. Treat all infested people at the same time. Check weekly. Avoid head-to-head contact during outbreaks. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a> to confirm. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a> for expert help.",
  ],
  "the-school-term-cycle-of-head-lice-infestations": () => [
    "## TL;DR",
    "Head lice peak when children return to school — September, after half-term, and after holidays. Close contact in classrooms and sleepovers drives spread. Check regularly and treat promptly.",
    "## Half-term holiday head lice?",
    "After half-term, children mix with new groups at activities and playdates. Sleepovers and shared hats increase contact. A quick wet comb check when they return can catch infestations early.",
    "## Summer holiday camp head lice?",
    "Camps and holidays bring children together for long periods. Head-to-head contact is common. Check before and after. Use silicone- or oil-based treatment or wet combing. Schools can use our <a href=\"/schools\" class=\"text-primary hover:underline\">school resources</a> for guidance.",
  ],
  "the-autumn-term-head-assault": () => [
    "## TL;DR",
    "Autumn term sees a spike in head lice as children return to school. Six tips: check weekly, tie long hair back, avoid sharing combs and hats, treat everyone at once, repeat after 7–10 days, and use proven methods.",
    "## 6 tips to stay lice-free this autumn",
    "1. Check hair weekly with a fine comb and conditioner. 2. Tie long hair in plaits or ponytails to reduce contact. 3. Don't share combs, brushes, or hats. 4. If you find lice, treat all infested household members at once. 5. Repeat treatment after 7–10 days. 6. Use silicone- or oil-based products or wet combing — avoid old insecticide products.",
    "## What to do next",
    "Use our free <a href=\"/\" class=\"text-primary hover:underline\">head lice checker</a> for an indicative result. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a> near you for professional removal. Schools can access our <a href=\"/schools\" class=\"text-primary hover:underline\">school resources</a>.",
  ],
  "superspreaders-and-head-lice": () => [
    "## TL;DR",
    "\"Superspreaders\" are people who carry more lice and pass them to more contacts. With head lice, anyone with an active infestation can spread them through head-to-head contact — there's no special \"superspreader\" type.",
    "## What are superspreaders?",
    "In infectious diseases, superspreaders infect disproportionately more people. With head lice, spread depends on head-to-head contact. Children who hug, share pillows, or sit close together are more likely to pass lice. The more lice someone has, the more chances for transfer.",
    "## Can superspreading occur with head lice?",
    "Lice crawl from one head to another. They can't jump or fly. Anyone with lice can spread them during close contact. The solution: treat everyone with confirmed lice at once, and avoid head-to-head contact until clear. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a> to confirm.",
  ],
  "professional-head-lice-removal-what-is-it-and-how-does-it-work": () => [
    "## TL;DR",
    "Professional head lice removal uses trained staff to manually remove lice and nits with fine combs and sometimes silicone-based products. It's an alternative to at-home treatment when products fail or time is limited.",
    "## What is professional head lice removal?",
    "Clinics offer hand-clearing: staff section the hair, apply conditioner or treatment, and comb through with fine-toothed combs to remove every louse and egg. Sessions typically take 30–60 minutes depending on hair length and infestation size.",
    "## How does the process work?",
    "You'll usually get a check first, then treatment. Staff use dimethicone or similar products plus thorough combing. Many clinics offer a guarantee and follow-up check. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a> near you. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a> for an indicative result before visiting.",
  ],
  "nit-hoover-how-they-work-and-where-to-get-them": () => [
    "## TL;DR",
    "Nit hoovers (electric lice combs) use suction to remove lice and nits. They can help but aren't a substitute for treatment — you still need to kill live lice with a silicone- or oil-based product or wet combing.",
    "## What is a nit hoover?",
    "A nit hoover is a battery-powered device with a fine comb and suction. As you comb through hair, it draws lice and eggs into a chamber. It can make removal easier, especially for nits that cling to hair.",
    "## How do nit hoovers work?",
    "You comb section by section from roots to ends. The suction pulls lice and nits into a disposable filter. They're available from pharmacies and online. Combine with a proper treatment — the hoover removes debris but doesn't kill lice. For stubborn cases, see a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">professional clinic</a>.",
  ],
  "negative-effects-of-head-lice-on-your-child": () => [
    "## TL;DR",
    "Head lice can cause anxiety, embarrassment, and sleep disruption in children. Reassure them that lice are common and not their fault. Treat promptly and avoid stigma.",
    "## Mental health and head lice",
    "Children may feel embarrassed or anxious about having lice. Some worry about being excluded or teased. Reassure them: lice are common, they don't mean dirty hair, and they're easy to treat. Keep a calm, matter-of-fact tone.",
    "## Post-traumatic lice disorder",
    "Some children develop lasting anxiety about lice after a bad experience. Prevent this by treating early, avoiding blame, and making checks routine rather than dramatic. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. For support, find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a> that treats families sensitively.",
  ],
  "in-head-lice-outbreaks-selfies-may-be-a-surprising-culprit": () => [
    "## TL;DR",
    "Teenagers taking selfies often put their heads together, creating head-to-head contact — the main way lice spread. Selfie culture may contribute to lice outbreaks in older children.",
    "## Are lice on the rise?",
    "Lice have always been common in school-aged children. In recent years, some experts suggest that selfies — with friends pressing heads together for photos — may increase head-to-head contact among teenagers, who traditionally had lower rates than younger children.",
    "## A lice comeback in teens?",
    "Lice spread by crawling. Any activity that brings heads close together (selfies, sleepovers, sports) can spread them. The solution is the same: check regularly, treat with silicone- or oil-based products or wet combing, and avoid head-to-head contact. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>.",
  ],
  "how-to-solve-recurring-head-lice-that-wont-go-away": () => [
    "## TL;DR",
    "Recurring head lice usually mean missed eggs, reinfestation from a contact, or incomplete treatment. Treat everyone at once, repeat after 7–10 days, comb daily, and check all household members.",
    "## Why can head lice be difficult to solve?",
    "Eggs hatch over 7–10 days. If you only treat once, new lice emerge. Old insecticide products often fail due to resistance. And if one person in the household still has lice, they can reinfest others.",
    "## Why do head lice keep recurring?",
    "Often a friend at school or a family member still has lice. Treat all infested people on the same day. Use silicone- or oil-based products or wet combing. Repeat after 7–10 days. Comb daily for two weeks. For persistent cases, see a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">professional clinic</a>. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a> to confirm.",
  ],
  "how-to-prevent-head-lice-with-five-practical-hairstyles": () => [
    "## TL;DR",
    "Tying hair back reduces head-to-head contact. Plaits, braids, buns, and ponytails keep hair contained. Lice crawl from one head to another — less loose hair means fewer opportunities.",
    "## Head lice like to travel",
    "Lice crawl along hair strands. When two heads touch, they move across. Long, loose hair brushes against others more easily. Tying hair back limits contact.",
    "## How to prevent head lice with plaiting or braiding",
    "Plaits and braids keep hair close to the head. Low ponytails and buns work too. No hairstyle prevents lice completely — they can still crawl onto tied hair — but contained hair reduces spread. Combine with weekly checks and avoid sharing combs and hats. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Schools can use our <a href=\"/schools\" class=\"text-primary hover:underline\">resources</a>.",
  ],
  "how-to-clean-hairbrushes-and-other-hair-products": () => [
    "## TL;DR",
    "Wash hairbrushes, combs, and hair accessories in hot soapy water (at least 50°C) for 10 minutes. Lice die within 24–48 hours off the scalp, but cleaning removes eggs and reduces reinfestation risk.",
    "## How to clean hairbrushes",
    "Soak brushes and combs in hot soapy water. Use a toothbrush to scrub between bristles. Rinse and air-dry. Metal combs can be boiled briefly. Avoid sharing brushes and combs during an infestation.",
    "## How to clean hairbands and scrunchies",
    "Wash in the washing machine on a hot cycle (60°C) or soak in hot soapy water. Pillowcases and hats can go in the wash too. The main way to stop spread is still treating everyone with lice and avoiding head-to-head contact. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>.",
  ],
  "how-to-choose-the-best-head-lice-treatment": () => [
    "## TL;DR",
    "Choose silicone- or oil-based products over insecticide-based ones — resistance is common. Wet combing is a chemical-free option. Avoid permethrin and similar pesticides; they often fail.",
    "## Chemical and non-chemical products",
    "Chemical products (permethrin, pyrethrins) kill lice with insecticides. Many lice are now resistant. Non-chemical options: silicone-based lotions (dimethicone) suffocate lice; oil-based products work similarly; wet combing physically removes them.",
    "## What is the best head lice treatment?",
    "Silicone-based products and wet combing are recommended by health bodies. They're safe for children and avoid resistance. Apply to dry hair, leave for the recommended time, repeat after 7–10 days. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a> for professional help.",
  ],
  "how-to-calculate-how-long-you-have-had-head-lice": () => [
    "## TL;DR",
    "You can estimate infestation length from the nit position: nits more than 1cm from the scalp are usually 2+ weeks old (hair grows ~1cm per month). Eggs hatch in 7–10 days; adult lice live ~30 days.",
    "## Understanding the lice cycle",
    "Female lice lay eggs near the scalp. Eggs hatch in 7–10 days. Young lice mature in about 10 days. Adult lice live ~30 days and lay more eggs. So an infestation can grow quickly.",
    "## Calculating how long you've had head lice",
    "Nits are laid at the base of the hair. As hair grows ~1cm per month, nits further from the scalp are older. Empty casings mean the louse has hatched. This helps estimate timing but doesn't change treatment — treat as soon as you find lice. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>.",
  ],
  "how-head-lice-alter-the-scalp-microbiota": () => [
    "## TL;DR",
    "Research suggests head lice may affect the community of bacteria on the scalp (microbiota). The practical impact is unclear — treat lice as usual with silicone- or oil-based products or wet combing.",
    "## Where is microbiota on the body?",
    "Microbiota are the communities of bacteria, viruses, and fungi that live on and in our bodies. The scalp has its own microbiota, which can influence skin health.",
    "## Why is microbiota important?",
    "Studies show that people with head lice may have different scalp bacteria than those without. This could affect itching or skin response. More research is needed. For now, focus on effective treatment: silicone- or oil-based products or wet combing. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>.",
  ],
  "head-lice-resistance-dimethicone": () => [
    "## TL;DR",
    "Some research suggests dimethicone-resistant lice may be emerging, but it's not widespread. Silicone-based products still work for most people. Wet combing remains a reliable alternative that doesn't depend on chemical action.",
    "## Recent clinical research on resistance",
    "Dimethicone works by coating lice and blocking their breathing pores. Unlike insecticides, resistance was thought unlikely. A few studies have reported reduced efficacy in some populations — more data is needed.",
    "## What to do if treatment fails",
    "If a silicone product doesn't work, try wet combing consistently for two weeks, or switch to another silicone or oil-based brand. Ensure you're repeating treatment after 7–10 days. For stubborn cases, see a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">professional clinic</a>. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a> to confirm.",
  ],
  "head-lice-prevention-in-schools": () => [
    "## TL;DR",
    "Schools can help prevent head lice by encouraging weekly checks, sharing evidence-based information, and avoiding \"no nit\" policies that exclude children. Parents should check at home and treat promptly.",
    "## Checking for head lice on your child",
    "Use the wet combing method: conditioner, fine comb, good light. Comb from roots to ends and wipe the comb on a tissue. Check weekly, especially after holidays and half-term. One live louse means treatment is needed.",
    "## Head lice school policy",
    "Many schools no longer have \"no nit\" policies — they exclude children unnecessarily. Better approach: inform parents when there's an outbreak, share our <a href=\"/schools\" class=\"text-primary hover:underline\">school resources</a>, and encourage treatment. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Clinics can support schools — find one <a href=\"/find-clinics\" class=\"text-primary hover:underline\">here</a>.",
  ],
  "head-lice-myths": () => [
    "## TL;DR",
    "Common myths: lice prefer dirty hair (false — they like any hair), pets spread lice (false — human lice only), lice jump (false — they crawl). Lice are common, treatable, and not a sign of poor hygiene.",
    "## Myth: Lice prefer dirty hair",
    "Lice feed on blood, not oil or dirt. They survive equally well on clean or dirty hair. Washing hair doesn't prevent or cure lice.",
    "## Myth: Lice jump or fly",
    "Lice have no wings and can't jump. They crawl from one head to another during direct contact. Spread happens through head-to-head contact, not from furniture or pets. Treat with silicone- or oil-based products or wet combing. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a> for help.",
  ],
  "head-lice-information-for-parents": () => [
    "## TL;DR",
    "Head lice are common, especially in children. They spread by head-to-head contact. Treat with silicone- or oil-based products or wet combing. Repeat after 7–10 days. Check everyone in the household.",
    "## What is the difference between a nit and an egg?",
    "A nit is a head louse egg. They're the same thing. Nits are oval, yellowish-white, and glued to hair near the scalp. Empty casings stay attached after hatching.",
    "## How do you get head lice?",
    "Lice crawl from one head to another during close contact. They can't jump or fly. Common sources: school, sleepovers, sports, playdates. Check with a wet comb. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a>. Schools can use our <a href=\"/schools\" class=\"text-primary hover:underline\">resources</a>.",
  ],
  "head-lice-in-curly-and-thick-hair": () => [
    "## TL;DR",
    "Lice can live in curly and thick hair. Detection and removal can take longer — detangle gently, use plenty of conditioner, and work in small sections. Silicone- or oil-based products and wet combing work for all hair types.",
    "## Can curly hair get head lice?",
    "Yes. Lice live on the scalp and feed on blood. Hair texture doesn't matter. Curly and thick hair can make combing more time-consuming, but the same treatment principles apply.",
    "## More difficult to get rid of head lice?",
    "Thick or curly hair may hide lice and nits. Use a fine metal comb, detangle first, and work in small sections. Extra conditioner helps the comb glide. Consider a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">professional clinic</a> for long or dense hair. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>.",
  ],
  "head-lice-in-adults-and-parents": () => [
    "## TL;DR",
    "Adults get head lice too, often from children. Parents are at higher risk because of close contact. Treat the same way: silicone- or oil-based products or wet combing. Check the whole household.",
    "## Head lice in adults",
    "Adults catch lice through head-to-head contact — from children, partners, or close contacts. There's no age limit. Symptoms are the same: itching, nits, sometimes crawling sensations.",
    "## Are parents at risk of catching head lice?",
    "Yes. Hugging, reading together, and helping with hair put parents in close contact. If your child has lice, check yourself and other family members. Treat everyone with confirmed lice at once. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a>.",
  ],
  "head-lice-bacteria-partners-in-crime": () => [
    "## TL;DR",
    "Head lice can carry bacteria, and scratching can introduce infection. This is rare. Focus on treating lice promptly with silicone- or oil-based products or wet combing to reduce itching and complications.",
    "## Head lice come with lots of bacteria",
    "Research shows lice can harbour bacteria on their bodies. When lice bite the scalp, and when people scratch, bacteria can enter broken skin.",
    "## What we know about the bacteria lice carry",
    "Most lice infestations don't cause serious infection. Keeping nails short and avoiding aggressive scratching helps. Treat lice early to reduce itching. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. For infected sores, see a GP. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a> for removal.",
  ],
  "french-study-of-head-lice-products": () => [
    "## TL;DR",
    "French research has shown increasing resistance to insecticide-based head lice products. Resistance can maintain or increase infestations. Switch to silicone- or oil-based treatments or wet combing.",
    "## An increase in resistance",
    "Studies in France and elsewhere show that permethrin and similar insecticides often fail because lice have evolved resistance. Continued use of ineffective products wastes time and allows infestations to grow.",
    "## What works instead?",
    "Silicone-based products (dimethicone) and wet combing don't rely on chemicals that lice can resist. They work by suffocation or physical removal. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a> for professional help.",
  ],
  "facts-about-nits-what-you-need-to-know-about-head-lice-eggs": () => [
    "## TL;DR",
    "Nits are head louse eggs: oval, yellowish-white, glued near the scalp. They hatch in 7–10 days. Remove with a fine comb; treat with silicone- or oil-based products. Dead nits may stay attached but won't hatch.",
    "## How can you tell if you have nits?",
    "Nits are small, oval, and firmly attached to hair shafts. They're often behind the ears or at the nape. They don't brush off like dandruff. Use a fine comb and good light to spot them.",
    "## Can you check or pull out nits with your fingers?",
    "Fingers can't reliably remove nits — they're glued on. Use a fine metal comb. Comb daily after treatment. Vinegar or nit-removal solutions can loosen the glue. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a>.",
  ],
  "eyelash-nits-what-are-they-and-how-to-get-rid-of-them": () => [
    "## TL;DR",
    "Eyelash nits are rare. They're usually pubic lice (crabs) that have spread to the lashes, not head lice. See a GP or pharmacist for safe removal — don't use head lice products near the eyes.",
    "## What are eyelash nits?",
    "True head lice rarely infest eyelashes. When nits appear on lashes, it's often pubic lice (Pthirus pubis), which can spread from the groin to eyebrows and lashes through touch.",
    "## If they're naturally occurring, why get rid of them?",
    "Lice on lashes cause irritation and can affect eye health. Removal needs care — never use head lice lotions near eyes. A GP or pharmacist can recommend safe methods. For scalp lice, use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a> and find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a>.",
  ],
  "does-tea-tree-oil-kill-head-lice": () => [
    "## TL;DR",
    "Tea tree oil has some insecticidal properties, but evidence for head lice is mixed. It's in many products, but concentration and formulation matter. Silicone-based products and wet combing are more reliable.",
    "## Tea tree oil is in a lot of head lice products – so it works, right?",
    "Tea tree oil is often added to shampoos and sprays. Some lab studies suggest it can affect lice, but real-world results vary. Products may combine it with other ingredients, so it's hard to attribute success to tea tree alone.",
    "## What does the NHS say about tea tree oil for head lice?",
    "The NHS doesn't recommend tea tree oil as a first-line treatment. Proven options are wet combing and silicone- or oil-based products. If you want to try tea tree, use a properly formulated product, not undiluted oil. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a>.",
  ],
  "does-nit-repellent-spray-really-work": () => [
    "## TL;DR",
    "Nit repellent sprays claim to deter lice with essential oils or similar. Evidence is limited — lice spread by head-to-head contact, and sprays don't create a lasting barrier. Weekly checks and prompt treatment are more effective.",
    "## How does nit repellent spray work?",
    "Sprays typically use essential oils (e.g. tea tree, lavender) that may smell unpleasant to lice. The idea is to make hair less attractive. They're applied before school or activities.",
    "## Why nit repellent spray can be ineffective",
    "Lice crawl onto hair during direct contact. A spray may wear off or dilute. There's no strong evidence they prevent infestation. Better approach: check weekly, tie hair back, avoid sharing combs. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a>.",
  ],
  "does-antihistamine-work-for-an-itchy-scalp": () => [
    "## TL;DR",
    "Antihistamines can reduce itching from head lice by blocking the allergic response to louse bites. They don't kill lice — you still need to treat with silicone- or oil-based products or wet combing.",
    "## Antihistamines and lice itching",
    "Itching from lice is caused by an allergic reaction to louse saliva. Oral antihistamines (e.g. cetirizine) can help relieve the itch while you treat. They're useful for children who scratch a lot.",
    "## Don't rely on antihistamines alone",
    "Antihistamines only ease symptoms. You must still remove or kill lice. Use a silicone- or oil-based product or wet combing. Repeat after 7–10 days. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a>.",
  ],
  "dandruff-vs-head-lice-and-nits-whats-the-difference": () => [
    "## TL;DR",
    "Dandruff is flaky skin; nits are eggs glued to hair. Dandruff brushes off; nits don't. Lice crawl; dandruff doesn't. Use a fine comb to tell them apart — nits stay on the comb, dandruff falls away.",
    "## Nits vs dandruff on a comb",
    "Nits are oval, yellowish-white, and firmly attached near the scalp. Dandruff is white or yellow flakes that slide off easily. Comb through hair: nits stay on the comb; dandruff falls or brushes away.",
    "## Does dandruff cause nits?",
    "No. Nits are louse eggs. Dandruff is dead skin cells. They're unrelated. If you see nits, you have lice — treat with silicone- or oil-based products or wet combing. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a>.",
  ],
  "daily-head-lice-check-routine": () => [
    "## TL;DR",
    "A quick weekly wet comb check takes 5–10 minutes and catches infestations early. Use conditioner, a fine comb, and good light. Check behind the ears and at the nape. Make it part of the routine.",
    "## Why daily head lice checks matter",
    "Weekly checks (daily during an outbreak) help catch lice before they multiply. Early treatment is simpler. It also reduces spread to others.",
    "## Checking for nits and head lice effectively",
    "Wash and condition hair. Comb from roots to ends in sections. Wipe the comb on a tissue and look for lice or eggs. Focus on behind the ears and the nape. One live louse means treat. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a>.",
  ],
  "causes-of-an-itchy-scalp-for-bald-men": () => [
    "## TL;DR",
    "Bald men don't get head lice — lice need hair to attach eggs and move around. Itchy scalp in bald men is usually dry skin, sunburn, folliculitis, or other conditions. See a GP if it persists.",
    "## Your bald scalp may be itching because of vitamin deficiency",
    "Dry, itchy scalp can sometimes relate to diet or vitamin levels. This is uncommon but worth considering if other causes are ruled out.",
    "## Your bald scalp may be itching because of inflamed hair follicles",
    "Folliculitis — inflamed hair follicles — can cause bumps and itching. So can sunburn, dry skin, or eczema. Head lice require hair; a fully bald scalp isn't a suitable habitat. If you have a beard and suspect lice, check there — see our <a href=\"/blog/can-bald-men-with-beards-get-head-lice\" class=\"text-primary hover:underline\">beard lice article</a>. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a> for family members with hair.",
  ],
  "can-you-build-resistance-to-head-lice-products": () => [
    "## TL;DR",
    "People don't build resistance — lice do. Insecticide-based products (permethrin) often fail because lice have evolved resistance. Silicone- and oil-based products work by suffocation, so resistance isn't an issue.",
    "## New clinical evidence on head lice products",
    "Research shows that permethrin and similar insecticides fail in many areas due to louse resistance. It's the lice that are resistant, not the person.",
    "## Research has uncovered head lice products are failing",
    "If a product doesn't work, switch to a silicone- or oil-based option or wet combing. These don't depend on chemicals. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a> for professional removal.",
  ],
  "can-head-lice-live-on-bedding": () => [
    "## TL;DR",
    "Head lice can briefly be found on bedding, pillows, or hats, but they can't survive long off the scalp. They die within 24–48 hours. Washing bedding is a sensible precaution, but the main spread is head-to-head contact.",
    "## Head lice can crawl off and be found in bedding",
    "Lice may crawl onto pillows or bedding during sleep. They're looking for a host — they need blood to survive.",
    "## How long can they live on the bedding?",
    "Lice die within about 24–48 hours away from the scalp. They can't reproduce off the head. Washing pillowcases and bedding in hot water is good hygiene but isn't the key to stopping spread. Treat everyone with lice and avoid head-to-head contact. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>.",
  ],
  "can-head-lice-jump-dispelling-the-myth-and-understanding-lice-behaviour": () => [
    "## TL;DR",
    "Head lice cannot jump or fly. They have no wings and no jumping legs. They crawl from one head to another during direct head-to-head contact.",
    "## The jumping myth debunked",
    "Lice are wingless and their legs are adapted for gripping hair, not jumping. The idea that they jump comes from how quickly they can move when disturbed.",
    "## Crawling with impressive speed",
    "Lice can crawl quickly along hair strands. When heads touch, they move from one to the other. That's why close contact — hugs, selfies, shared pillows — spreads them. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a>.",
  ],
  "can-dogs-get-lice": () => [
    "## TL;DR",
    "Dogs cannot get human head lice. Lice are species-specific: human lice only live on humans; dog lice only on dogs. Different species, different hosts.",
    "## Human and animal blood differences",
    "Human head lice (Pediculus humanus capitis) feed on human blood. Dog lice (e.g. Linognathus setosus) are a different species and live on dogs. They don't cross over.",
    "## Lice species",
    "If your dog is scratching, it could be fleas, mites, or dog lice — not human head lice. Treat human head lice with silicone- or oil-based products or wet combing. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a>.",
  ],
  "can-cats-get-lice": () => [
    "## TL;DR",
    "Cats cannot get human head lice. Human lice are species-specific. Cat lice (if any) are a different species. Your cat is not a reservoir for head lice.",
    "## Human and animal blood",
    "Human head lice need human blood. They can't survive on cats. Cat lice (Felicola subrostratus) are a different species that only infest cats.",
    "## Cat-specific parasites",
    "Cats get fleas, mites, or cat lice — not human head lice. Don't worry about passing head lice to or from your cat. Focus on treating human infestations with silicone- or oil-based products or wet combing. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>.",
  ],
  "can-bald-men-with-beards-get-head-lice": () => [
    "## TL;DR",
    "Bald men with beards can get head lice in their beard hair. Lice need hair to live — they'll attach to beard hair if it's long enough. Treat the same way: silicone- or oil-based products or wet combing.",
    "## Where can head lice turn up, other than in the hair?",
    "Head lice prefer the scalp but can live in any hair on the head — including beards, moustaches, and eyebrows. They need hair to attach eggs and move around.",
    "## How to deal with head lice in a beard?",
    "Apply the same treatment to the beard: silicone- or oil-based product or wet combing. Use a fine comb through the beard. Repeat after 7–10 days. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a>.",
  ],
  "can-a-head-lice-drug-kill-coronavirus": () => [
    "## TL;DR",
    "Ivermectin is a drug used for some parasitic infections; it was studied for Covid-19 but is not approved for that use. Don't use ivermectin for head lice — use silicone- or oil-based products or wet combing.",
    "## Promise and caution",
    "Early in the pandemic, some lab studies suggested ivermectin might affect the virus. Clinical trials did not support its use for Covid-19. Health authorities do not recommend it for that purpose.",
    "## What is ivermectin?",
    "Ivermectin is used for certain parasitic infections. It's not a standard head lice treatment. For head lice, use proven methods: silicone- or oil-based products or wet combing. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a>.",
  ],
  "can-a-hair-straightener-kill-lice": () => [
    "## TL;DR",
    "Hair straighteners can kill lice they directly touch, but they miss most lice and don't kill eggs. They can burn the scalp. Use silicone- or oil-based products or wet combing instead.",
    "## Does using a hair straightener kill lice?",
    "Heat can kill lice, but straighteners only affect the strands you pass over. Lice and eggs are close to the scalp; you'd risk burning the skin. It's not a reliable or safe method.",
    "## Why hair straighteners are ineffective for lice eggs",
    "Eggs are glued to the hair shaft. Straighteners would need to heat every egg — impractical and dangerous. Use a silicone- or oil-based product or wet combing. Repeat after 7–10 days. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a>.",
  ],
  "best-nit-combs-in-the-uk-market": () => [
    "## TL;DR",
    "The best nit combs have fine, metal teeth (0.2–0.3mm spacing) and are durable. Long-toothed combs reach the scalp; spiral-toothed combs can help with thick hair. Look for dentistry-grade metal.",
    "## Long-toothed metal nit combs",
    "Metal combs with long, fine teeth reach the scalp and remove nits effectively. Plastic combs often have wider spacing and miss eggs. Metal is also easier to clean and sterilise.",
    "## Straight-toothed vs spiral-toothed nit combs",
    "Straight-toothed combs are standard. Spiral-toothed combs can grip nits in thick or curly hair. Both work — choose based on hair type. Use with conditioner for wet combing. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a>.",
  ],
  "back-to-school-surviving-head-lice-in-september": () => [
    "## TL;DR",
    "September is a peak time for head lice as children return to school and mix with new classmates. Check hair weekly, treat promptly if you find lice, and use silicone- or oil-based products or wet combing.",
    "## Head lice and back to school",
    "When school starts, head-to-head contact increases. Lice spread quickly in classrooms, at playtime, and during activities. A quick check in the first few weeks can catch infestations early.",
    "## Why is September such a flash point for head lice?",
    "Children have been apart over summer. When they return, they're in close contact again. One child with lice can pass them to many others. Check before term starts and weekly after. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Schools can use our <a href=\"/schools\" class=\"text-primary hover:underline\">resources</a>. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a>.",
  ],
  "are-lice-in-blonde-hair-easier-to-find": () => [
    "## TL;DR",
    "It's a myth that lice are easier to spot in blonde hair. Nits can blend with blonde strands, making them harder to see. Dark hair often provides more contrast. Use good lighting and a fine comb either way.",
    "## Spotting lice",
    "Adult lice are tan or grey and may be easier to see against dark hair. In blonde hair, nits (pale yellow or white) can blend in. There's no universal rule — it depends on hair colour and lighting.",
    "## Removing lice",
    "Treatment is the same for all hair colours: silicone- or oil-based products or wet combing. Repeat after 7–10 days. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a>.",
  ],
  "an-itchy-scalp-might-not-always-be-head-lice": () => [
    "## TL;DR",
    "An itchy scalp has many causes: dandruff, eczema, product buildup, psoriasis, or head lice. Check for lice with a wet comb first — it's quick and rules out the most common cause in children.",
    "## Causes of itchy scalp",
    "Dandruff, dry skin, eczema, contact dermatitis, and psoriasis can all cause itching. So can head lice. The only way to rule out lice is to comb through the hair and look.",
    "## DEC plugs and other causes",
    "Seborrheic dermatitis (dandruff) can cause flakes and itching. If a wet comb finds no lice, consider other causes and see a pharmacist or GP. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a> for an indicative result. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a>.",
  ],
  "all-you-need-to-know-about-the-nit-nurse": () => [
    "## TL;DR",
    "Nit nurses were school staff who checked children for head lice. Most UK schools no longer have them due to policy changes. Parents now do checks at home. Weekly wet combing is the recommended approach.",
    "## What is a nit nurse?",
    "Nit nurses (or school nurses) used to inspect children's hair for lice. They would send children home if nits were found. The role was common in the UK until the late 1980s and 1990s.",
    "## When and why did the nit nurse disappear from schools?",
    "\"No nit\" policies were phased out because they excluded children unnecessarily — nits can remain after treatment and don't always mean active infestation. Schools now focus on informing parents and encouraging home checks. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Our <a href=\"/schools\" class=\"text-primary hover:underline\">school resources</a> help. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a>.",
  ],
  "5-tips-to-prevent-the-spread-of-lice": () => [
    "## TL;DR",
    "Five tips: (1) Check hair weekly with a fine comb. (2) Tie long hair back. (3) Don't share combs, brushes, or hats. (4) Treat everyone with lice at once. (5) Repeat treatment after 7–10 days.",
    "## 1. Check weekly",
    "Use the wet combing method: conditioner, fine comb, good light. Catching lice early stops them spreading and makes treatment easier.",
    "## 2. Tie hair back",
    "Plaits, ponytails, and buns reduce head-to-head contact. Less loose hair means fewer opportunities for lice to crawl across.",
    "## 3. Don't share",
    "Combs, brushes, hats, and headphones can theoretically carry lice (they die within 24–48 hours off the scalp). Avoid sharing during outbreaks.",
    "## 4. Treat everyone at once",
    "If more than one person has lice, treat them all on the same day. Otherwise, reinfestation is likely.",
    "## 5. Repeat treatment",
    "Eggs hatch in 7–10 days. Repeat your chosen treatment after a week to catch newly hatched lice. Use our free <a href=\"/\" class=\"text-primary hover:underline\">checker</a>. Find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a>. Schools: see our <a href=\"/schools\" class=\"text-primary hover:underline\">resources</a>.",
  ],
};

const USELESS_H2 = /^(Share this post|Why choose us|Older posts|Our latest posts)$/i;
function sanitizeH2(h) {
  if (!h || h.length < 15 || USELESS_H2.test(h)) return null;
  return h;
}

// Fallback for topics without custom content
function defaultContent(t) {
  const desc = t.metaDesc.replace(/Hairforce|The Hairforce/gi, "Head Lice Checker").replace(/our clinics/gi, "professional clinics").slice(0, 200);
  const h2_1 = sanitizeH2(t.h2_1) || "Key points";
  const h2_2 = sanitizeH2(t.h2_2) || "What to do next";
  return [
    "## TL;DR",
    desc || "Head lice are common and treatable. Confirm with a wet comb, then use a silicone- or oil-based product or wet combing. Repeat after 7–10 days.",
    `## ${h2_1}`,
    "Head lice are common and treatable. The best approach is to confirm an infestation with a wet comb, then use a silicone- or oil-based product or consistent wet combing. Repeat treatment after 7–10 days and comb daily to remove eggs.",
    `## ${h2_2}`,
    "If you're unsure whether you have lice, use our free <a href=\"/\" class=\"text-primary hover:underline\">head lice checker</a> for an indicative result. For professional removal, find a <a href=\"/find-clinics\" class=\"text-primary hover:underline\">clinic</a> near you.",
  ];
}

const newPosts = topics.map((t) => {
  const body = (contentMap[t.slug] || (() => defaultContent(t)))();
  const wordCount = body.join(" ").split(/\s+/).length;
  const readMinutes = Math.max(4, Math.ceil(wordCount / 200));
  return {
    slug: t.slug,
    title: t.title.replace(/\s*\|\s*The Hairforce.*$/i, "").trim(),
    description: (() => {
        const s = t.metaDesc.replace(/Hairforce|The Hairforce/gi, "Head Lice Checker").replace(/We are experts.*/gi, "Get practical tips here.");
        if (s.length <= 160) return s;
        const cut = s.slice(0, 160);
        const lastSpace = cut.lastIndexOf(" ");
        return lastSpace > 120 ? cut.slice(0, lastSpace) : cut;
      })(),
    publishedAt: today,
    updatedAt: today,
    readMinutes,
    category: pickCategory(t.slug),
    author: "Head Lice Checker Editorial Team",
    keywords: slugToKeywords(t.slug),
    isPublished: true,
    image: `/blog_images/${t.slug}.jpg`,
    body,
  };
});

const outputPath = resolve(process.cwd(), "scripts/generated-posts.json");
writeFileSync(outputPath, JSON.stringify(newPosts, null, 2));
console.log(`Generated ${newPosts.length} posts to ${outputPath}`);
