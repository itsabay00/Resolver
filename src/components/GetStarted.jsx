import { Inbox, MessagesSquare, Send } from "lucide-react";
import { colors } from "../lib/colors.js";
import { Card } from "./ui.jsx";

const STEPS = [
  {
    icon: Inbox,
    title: "Get cases",
    description: "Paste in a customer's message to start a new case, with any order number or account details you already have.",
  },
  {
    icon: MessagesSquare,
    title: "Get resolutions",
    description: "Chat with the assistant to draft a reply grounded in your knowledge base, then refine it until it's ready.",
  },
  {
    icon: Send,
    title: "Forward to customers",
    description: "Copy the finished reply and send it to your customer through whatever channel they reached out on.",
  },
];

export default function GetStarted({ onStart }) {
  return (
    <div>
      <div className="w-11 h-11 rounded-full mb-4" style={{ backgroundColor: colors.lightGray }} />
      <h2 className="text-2xl font-semibold mb-6" style={{ color: colors.black }}>Welcome</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STEPS.map((step) => (
          <Card key={step.title} className="overflow-hidden">
            <div className="h-28 flex items-center justify-center" style={{ backgroundColor: colors.lightGray }}>
              <step.icon className="w-7 h-7" style={{ color: colors.gray }} />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold" style={{ color: colors.black }}>{step.title}</h3>
              <p className="text-sm mt-1" style={{ color: colors.gray }}>{step.description}</p>
            </div>
          </Card>
        ))}
      </div>

      <button onClick={onStart} className="text-sm font-medium underline mt-6" style={{ color: colors.ink }}>
        Start a case →
      </button>
    </div>
  );
}
