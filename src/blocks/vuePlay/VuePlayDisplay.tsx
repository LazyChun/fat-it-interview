import React from "react";
import { Radio, Switch } from "antd";
import type { FatNotesPluginSDK } from "fat-notes-sdk";
import { readVuePlay, type VuePlayOptions } from "./defaultSource";
import "./VuePlayBlock.css";

type HostComponent = React.FC<{
  title?: string;
  label?: React.ReactNode;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}>;

interface EditBlock {
  options?: unknown;
}

/**
 * 配置抽屉右侧：主题、控制台、Less 编辑器，以及卡片外框。
 */
const VuePlayDisplay: React.FC<{ sdk: FatNotesPluginSDK }> = ({ sdk }) => {
  const common = sdk.remoteComponents.BlockConfigCommon;
  const flow = sdk.remoteComponents.FlowEditCommon;
  const DisplayCollapse = common.DisplayCollapse as HostComponent;
  const DisplayBox = common.DisplayBox as HostComponent;
  const DisplayHighLight = common.DisplayHighLight as HostComponent;
  const BlockName = common.BlockName as HostComponent;
  const PanelDisplay = common.PanelDisplay as HostComponent;
  const FatForm = flow.FatForm as HostComponent & { Item: HostComponent };
  const useAppDispatch = flow.useAppDispatch as () => (action: {
    type: string;
    payload: unknown;
  }) => void;
  const useAppSelector = flow.useAppSelector as <T>(
    selector: (state: { blockEdit?: { currentBlock?: EditBlock } }) => T,
  ) => T;

  const dispatch = useAppDispatch();
  const currentBlock = useAppSelector((state) => state.blockEdit?.currentBlock);
  const play = readVuePlay(currentBlock?.options);

  const patch = (value: Partial<VuePlayOptions>) => {
    dispatch({
      type: "blockEdit/onUpdateEditBlock",
      payload: {
        path: "options.vuePlay",
        value: { ...play, ...value },
      },
    });
  };

  return (
    <div className="fat-vue-play-display">
      <DisplayCollapse title="样式">
        <FatForm style={{ marginTop: 16 }}>
          <BlockName />
          <DisplayBox>
            <FatForm.Item label={<DisplayHighLight>主题</DisplayHighLight>}>
              <Radio.Group
                value={play.theme}
                onChange={(event) =>
                  patch({ theme: event.target.value === "light" ? "light" : "dark" })
                }
              >
                <Radio.Button value="dark">深色</Radio.Button>
                <Radio.Button value="light">浅色</Radio.Button>
              </Radio.Group>
            </FatForm.Item>
          </DisplayBox>
          <DisplayBox>
            <FatForm.Item label={<DisplayHighLight>显示控制台</DisplayHighLight>}>
              <Switch
                checked={play.showConsole}
                onChange={(checked) => patch({ showConsole: checked })}
              />
            </FatForm.Item>
          </DisplayBox>
          <DisplayBox>
            <FatForm.Item label={<DisplayHighLight>控制台位置</DisplayHighLight>}>
              <Radio.Group
                value={play.consolePlacement}
                disabled={!play.showConsole}
                onChange={(event) =>
                  patch({
                    consolePlacement: event.target.value === "right" ? "right" : "bottom",
                  })
                }
              >
                <Radio.Button value="right">右侧</Radio.Button>
                <Radio.Button value="bottom">下侧</Radio.Button>
              </Radio.Group>
            </FatForm.Item>
          </DisplayBox>
          <DisplayBox>
            <FatForm.Item label={<DisplayHighLight>显示 Less</DisplayHighLight>}>
              <Switch checked={play.showLess} onChange={(checked) => patch({ showLess: checked })} />
            </FatForm.Item>
          </DisplayBox>
          <div className="fat-vue-play-display-hint">
            深色和浅色只作用在代码编辑器和控制台。预览页保持白底。组件里的 {"<style scoped>"}{" "}
            只作用在本组件。打开「显示 Less」后可以再写一段全局 Less，运行时和 {"<style>"}{" "}
            一起编译进预览页。可以从 ant-design-vue 引入组件，模板里也可以直接写 a-button。控制台在下侧时放在代码下面，在右侧时放在页面下面。
          </div>
        </FatForm>
      </DisplayCollapse>
      <PanelDisplay />
    </div>
  );
};

export default VuePlayDisplay;
