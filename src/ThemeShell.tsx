import React, { useEffect, useMemo, useState } from "react";
import type { FatNotesPluginSDK } from "fat-notes-sdk";
import { ConfigProvider, theme as antdTheme } from "antd";

interface Props {
  sdk: FatNotesPluginSDK;
  padding?: number;
  /** 为 false 时由子节点自己滚动，适合左右分栏 */
  scroll?: boolean;
  children: React.ReactNode;
}

const ThemeShell: React.FC<Props> = ({
  sdk,
  padding = 12,
  scroll = true,
  children,
}) => {
  const [theme, setTheme] = useState<string>(() => {
    try {
      return sdk.ui.theme.get();
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    let disposed = false;
    const sub = sdk.ui.theme.onChange((next) => {
      if (!disposed) setTheme(next);
    });
    return () => {
      disposed = true;
      sub.dispose();
    };
  }, [sdk]);

  const isDark = theme === "dark";
  const themeConfig = useMemo(
    () => ({
      algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: { fontSize: 13 },
    }),
    [isDark],
  );

  return (
    <ConfigProvider theme={themeConfig}>
      <div
        style={{
          height: "100%",
          minHeight: 0,
          padding,
          boxSizing: "border-box",
          overflow: scroll ? "auto" : "hidden",
          color: isDark ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.88)",
        }}
      >
        {children}
      </div>
    </ConfigProvider>
  );
};

export default ThemeShell;
