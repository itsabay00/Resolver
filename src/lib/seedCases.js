// Simulated incoming cases — stands in for a real channel (email inbox, contact
// form) until one is connected. Each "Get next case" pull takes the next one
// from this pool, cycling back around once they've all been used.
export const SEED_CASES = [
  {
    message: "Hi, I ordered a blender two weeks ago (order #48291) and it still hasn't arrived. The tracking hasn't updated in 5 days. Can you tell me what's going on?",
    context: "Order #48291, placed 2 weeks ago, tracking stalled for 5 days",
    customerEmail: "jordan.m@example.com",
  },
  {
    message: "The jacket I received is the wrong size — I ordered a Large but got a Small. I need this sorted before my trip next week.",
    context: "Wrong size received (ordered L, got S), traveling in one week",
    customerEmail: "priya.k@example.com",
  },
  {
    message: "I was charged twice for the same order. Order #55102 shows two charges of $64.50 on my card statement from the same day.",
    context: "Order #55102, duplicate charge of $64.50 x2",
    customerEmail: "d.osei@example.com",
  },
  {
    message: "The coffee maker I bought stopped working after 3 days. It won't turn on at all anymore. I'd like a replacement or refund.",
    context: "Product failed after 3 days of use, wants replacement or refund",
    customerEmail: "amara.b@example.com",
  },
  {
    message: "I can't log into my account anymore, it says my email isn't recognized but I've used this account for over a year.",
    context: "Account login issue, long-standing customer",
    customerEmail: "kwesi.t@example.com",
  },
  {
    message: "Do you ship to Kumasi, and how long does delivery usually take from Accra?",
    context: "General shipping question, no order yet",
    customerEmail: "abena.f@example.com",
  },
];
