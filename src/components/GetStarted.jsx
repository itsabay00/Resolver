import { colors } from "../lib/colors.js";
import { Card } from "./ui.jsx";

const STEPS = [
  {
    title: "Get cases",
    description: "Paste in a customer's message to start a new case, with any order number or account details you already have.",
  },
  {
    title: "Get resolutions",
    description: "Chat with the assistant to draft a reply grounded in your knowledge base, then refine it until it's ready.",
  },
  {
    title: "Forward to customers",
    description: "Copy the finished reply and send it to your customer through whatever channel they reached out on.",
  },
];

export default function GetStarted({ onStart }) {
  return (
    <div>
      <div className="flex flex-col gap-[16px] mb-[40px]">
        <div className="w-[44px] h-[44px] rounded-full" style={{ backgroundColor: colors.lightGray }} />
        <h2 className="text-[20px] font-medium tracking-[-0.4px]" style={{ color: colors.black }}>Welcome, Bless</h2>
      </div>

      <div className="flex flex-wrap gap-[20px]">
        {STEPS.map((step) => (
          <Card key={step.title} className="w-[200px] shrink-0 overflow-hidden">
            <div className="h-[120px] w-full" style={{ backgroundColor: colors.bg }} />
            <div className="flex flex-col gap-[4px] p-[12px] text-[12px]">
              <span className="font-normal" style={{ color: colors.black }}>{step.title}</span>
              <span className="font-normal" style={{ color: colors.gray }}>{step.description}</span>
            </div>
          </Card>
        ))}
      </div>

      <button onClick={onStart} className="text-sm font-normal underline mt-6" style={{ color: colors.ink }}>
        Start a case →
      </button>
    </div>
  );
}
