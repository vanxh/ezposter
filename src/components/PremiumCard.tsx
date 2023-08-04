import { Check, DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type PremiumCardProps = {
  plan: string;
  pricePerMonth: number;
  features: {
    [key: string]: boolean | number;
  };
  productId?: string;
};

const PremiumCard = ({
  plan,
  pricePerMonth,
  features,
  productId,
}: PremiumCardProps) => {
  return (
    <div className="flex w-full flex-col gap-y-4 rounded-lg border border-border bg-background px-4 py-6 text-left md:w-[350px]">
      <h3 className="text-xl font-medium">{plan}</h3>

      <span className="inline-flex items-center">
        <DollarSign className="inline-block h-6 w-6" />
        <span className="space-x-1">
          <span className="text-4xl font-semibold">{pricePerMonth}</span>
          <span className="text-2xl font-medium text-foreground/80">USD</span>
        </span>
      </span>

      <div className="flex flex-col gap-y-2">
        {Object.keys(features).map((f) => (
          <span key={f} className="inline-flex items-center gap-x-2">
            {features[f] ? (
              <Check className="h-6 w-6 text-green-500" />
            ) : (
              <X className="h-6 w-6 text-red-500" />
            )}
            <span className="text-base font-medium">{f}</span>
            {typeof features[f] === "number" && (
              <span className="text-base font-semibold">- {features[f]}</span>
            )}
          </span>
        ))}
      </div>

      {productId && (
        <Button data-sellix-product={productId} type="submit">
          Purchase
        </Button>
      )}
    </div>
  );
};

export default PremiumCard;
