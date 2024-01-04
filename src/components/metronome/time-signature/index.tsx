import { ComponentPropsWithoutRef, FC } from "react";
import { cn } from "../../../lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../ui/select";

export type TTimeSignature = {
  numerator: number;
  denominator: number;
};

interface Props extends ComponentPropsWithoutRef<"div"> {
  className?: string;
  signature: TTimeSignature;
  onValueChange: (signature: TTimeSignature) => void;
}

const numerators = [1, 2, 3, 4, 5, 6, 7, 8];

const denominators = [1, 2, 4, 8, 16, 32, 64];

const TimeSignature: FC<Props> = ({
  className,
  signature,
  onValueChange,
  ...props
}) => {
  return (
    <>
      <div className={cn("flex flex-col gap-2", className)} {...props}>
        <h3>Time Signature:</h3>
        <Select
          defaultValue={signature.numerator + ""}
          onValueChange={(v) =>
            onValueChange({ ...signature, numerator: Number(v) })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Numerator" />
          </SelectTrigger>
          <SelectContent>
            {numerators.map((numerator) => (
              <SelectItem key={numerator} value={numerator + ""}>
                {numerator}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          defaultValue={signature.denominator + ""}
          onValueChange={(v) =>
            onValueChange({ ...signature, denominator: Number(v) })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Denominator" />
          </SelectTrigger>
          <SelectContent>
            {denominators.map((denominator) => (
              <SelectItem key={denominator} value={denominator + ""}>
                {denominator}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default TimeSignature;
