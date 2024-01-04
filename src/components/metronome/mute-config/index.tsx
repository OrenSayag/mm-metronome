import { ComponentPropsWithoutRef, FC } from "react";
import { cn } from "../../../lib/utils";
import { TMuteConfig } from "../../../types/metronome.types";
import { Checkbox } from "../../ui/checkbox";
import { Input } from "../../ui/input";

interface Props extends ComponentPropsWithoutRef<"div"> {
  className?: string;
  config?: TMuteConfig;
  onValueChange: (config: TMuteConfig | undefined) => void;
}

const MuteConfig: FC<Props> = ({
  className,
  config,
  onValueChange,
  ...props
}) => {
  return (
    <>
      <div className={cn("flex flex-col gap-2", className)} {...props}>
        <div className={"flex gap-2"}>
          <Checkbox
            onCheckedChange={(c) =>
              onValueChange(
                c
                  ? {
                      per: config?.per ?? 1,
                      muteAmount: config?.muteAmount ?? 1,
                      isMute: true,
                    }
                  : undefined,
              )
            }
            id={"is-mute"}
            checked={config?.isMute === true}
          />
          <label
            htmlFor="is-mute"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Mute
          </label>
        </div>
        <label>Mute:</label>
        <div className={"relative"}>
          <Input
            onChange={(e) =>
              !Number.isNaN(Number(e.target.value)) &&
              onValueChange({
                per: config?.per || 1,
                muteAmount: Number(e.target.value),
                isMute: true,
              })
            }
            placeholder={"Mute amount"}
            disabled={!config?.isMute}
            value={config?.muteAmount}
          />
          <span className={"absolute right-0"}>Bar</span>
        </div>
        <label>Per:</label>
        <div className={"relative"}>
          <Input
            onChange={(e) =>
              !Number.isNaN(Number(e.target.value)) &&
              onValueChange({
                muteAmount: config?.muteAmount || 1,
                per: Number(e.target.value),
                isMute: true,
              })
            }
            placeholder={"Per bars"}
            disabled={!config?.isMute}
            value={config?.per}
          />
          <span className={"absolute right-0"}>Bars</span>
        </div>
      </div>
    </>
  );
};

export default MuteConfig;
