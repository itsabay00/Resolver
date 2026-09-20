import { useState } from "react";
import { colors } from "../lib/colors.js";
import { Card } from "./ui.jsx";

export default function SettingsView({ onResetAll }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div>
      <h2 className="text-base font-semibold mb-4" style={{ color: colors.black }}>Settings</h2>

      <Card className="p-5">
        <h3 className="text-sm font-semibold" style={{ color: colors.black }}>Reset all data</h3>
        <p className="text-sm mt-1" style={{ color: colors.gray }}>
          Clears every case and knowledge-base entry stored in this browser. This can't be undone.
        </p>
        <div className="mt-4">
          {!confirming ? (
            <button onClick={() => setConfirming(true)} className="text-sm font-semibold underline" style={{ color: colors.ink }}>
              Reset everything
            </button>
          ) : (
            <span className="text-sm" style={{ color: colors.gray }}>
              Are you sure?{" "}
              <button
                onClick={() => {
                  onResetAll();
                  setConfirming(false);
                }}
                className="font-semibold underline"
                style={{ color: colors.black }}
              >
                Yes, reset
              </button>
              {" · "}
              <button onClick={() => setConfirming(false)} className="font-semibold underline" style={{ color: colors.gray }}>
                Cancel
              </button>
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}
