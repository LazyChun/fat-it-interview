import React, { useState } from "react";
import type { FatNotesPluginSDK } from "fat-notes-sdk";
import { Select } from "antd";
import { DEMOS } from "../algo/registry";
import AlgoPlayer from "../components/AlgoPlayer";
import ThemeShell from "../ThemeShell";

const AlgoBlock: React.FC<{ sdk: FatNotesPluginSDK }> = ({ sdk }) => {
  const [demoId, setDemoId] = useState(DEMOS[0]?.id ?? "bubble");
  return (
    <ThemeShell sdk={sdk} padding={12}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
        <Select
          size="small"
          value={demoId}
          options={DEMOS.map((demo) => ({ value: demo.id, label: demo.title }))}
          onChange={(value) => setDemoId(value)}
          style={{ width: 180 }}
          popupMatchSelectWidth={false}
        />
        <AlgoPlayer demoId={demoId} compact />
      </div>
    </ThemeShell>
  );
};

export default AlgoBlock;
