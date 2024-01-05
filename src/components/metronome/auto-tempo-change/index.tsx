import { ComponentPropsWithoutRef, FC } from "react";
import { cn } from "../../../lib/utils";
import { TAutoTempoIncreaseConfig } from "@/src/types/metronome.types";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";

interface Props extends ComponentPropsWithoutRef<"div"> {
  className?: string;
  config: TAutoTempoIncreaseConfig;
  onValueChange: (config: TAutoTempoIncreaseConfig) => void;
}

const directions = ["increase", "decrease", "random"];

const AutoTempoChange: FC<Props> = ({
  className,
  onValueChange,
  config,
  ...props
}) => {
  const { active, step, perMeasures, direction, random } = config;
  return (
    <>
      <div className={cn("flex flex-col gap-2", className)} {...props}>
        <div className={"flex gap-2"}>
          <Checkbox
            onCheckedChange={(c) => onValueChange({ ...config, active: !!c })}
            id={"auto-tempo-change-active"}
            checked={config.active}
          />
          <label
            htmlFor="auto-tempo-change-active"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Auto Tempo Change
          </label>
        </div>
        <Select
          defaultValue={direction}
          disabled={!active}
          onValueChange={(v) =>
            onValueChange({
              ...config,
              direction: v as TAutoTempoIncreaseConfig["direction"],
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent>
            {directions.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label>Step:</label>
        <div className={"flex gap-2"}>
          <Checkbox
            onCheckedChange={(c) => onValueChange({ ...config, random: !!c })}
            id={"auto-tempo-change-random-step"}
            checked={random}
            disabled={!active}
          />
          <label
            htmlFor="auto-tempo-change-random-step"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Random Step
          </label>
        </div>
        {!random && (
          <Input
            value={step}
            onChange={(e) =>
              !Number.isNaN(Number(e.target.value)) &&
              onValueChange({
                ...config,
                step: Number(e.target.value),
              })
            }
            disabled={!active}
          />
        )}
        <label>Per Measures:</label>
        {
          <Input
            value={perMeasures}
            onChange={(e) =>
              !Number.isNaN(Number(e.target.value)) &&
              onValueChange({
                ...config,
                perMeasures: Number(e.target.value),
              })
            }
            disabled={!active}
          />
        }
      </div>
    </>
  );
};

export default AutoTempoChange;
