import type { VariantProps } from "class-variance-authority";
import { ArrowLeftIcon, CheckIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import type { PriceId } from "~/actions/stripe";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface PricingPlan {
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: VariantProps<typeof buttonVariants>["variant"];
  isPopular?: boolean;
  savePercentage?: string;
  priceId: PriceId;
}
const plans: PricingPlan[] = [
  {
    title: "Small Pack",
    price: "9€",
    description: "Perfect for occasional podcast creators.",
    features: ["50 Credits", "No expiration", "Download all clips"],
    buttonText: "Buy 50 credits",
    buttonVariant: "outline",
    priceId: "small",
  },
  {
    title: "Medium Pack",
    price: "24€",
    description: "Ideal for regular podcast creators, affiliate marketers.",
    features: ["150 Credits", "No expiration", "Download all clips"],
    buttonText: "Buy 150 credits",
    isPopular: true,
    savePercentage: "Save 11%",
    buttonVariant: "default",
    priceId: "medium",
  },
  {
    title: "Large Pack",
    price: "60€",
    description: "Best value for frequent podcast studio and agencies.",
    features: ["500 Credits", "No expiration", "Download all clips"],
    buttonText: "Buy 300 credits",
    savePercentage: "Save 16%",
    buttonVariant: "outline",
    priceId: "large",
  },
];
function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <Card
      className={cn(
        "relative flex flex-col p-6 shadow-lg",
        plan.isPopular ? "border-primary border-2" : "",
      )}
    >
      {plan.isPopular && (
        <div className="bg-primary 
         text-primary-foreground absolute top-0 left-1/2 -translate-x-1/2 
         -translate-y-1/2 transform rounded-full px-3 py-1 text-sm font-medium">
          {" "}
          Most Popular
        </div>
      )}
      <CardHeader className="flex-1">
        <CardTitle>{plan.title}</CardTitle>
        <div className="text-4xl font-bold">{plan.price} </div>
        {plan.savePercentage && (
          <p className="text-sm font-medium text-green-600">
            {plan.savePercentage}
          </p>
        )}
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <ul className="text-muted-foreground space-y-2 text-sm">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <CheckIcon className="mr-2 inline-block h-4 w-4 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <form className="w-full">
          <Button variant={plan.buttonVariant} className="w-full" type="submit">
            {plan.buttonText}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

const BillingPage = () => {
  return (
    <div className="mx-auto flex flex-col space-y-8 px-4 py-12">
      <div className="relative flex items-center gap-4">
        <Button
          variant={"outline"}
          className="absolute top-0 left-0"
          size={"icon"}
          asChild
        >
          <Link href="/dashboard">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <div className="flex-1 space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            Buy credits
          </h1>
          <p className="text-muted-foreground">
            Purchase to generate more clips.The more credits you have, the more
            clips you can create from your uploaded videos.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard key={plan.title} plan={plan} />
        ))}
      </div>
      <div className="bg-muted/50 rounded-lg p-6">
        <h3 className="mb-4 text-lg font-semibold">How credit works</h3>
        <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm">
          <li>1 credit = 1 min of podcast processing</li>
          <li>The program will create around 1 clip per 5 mins of podcast</li>
          <li>Credits do not expire and can be used anytime</li>
          <li>Longer Podcast require more credits.</li>
          <li>All package are one-time purchases (not subscription).</li>
        </ul>
      </div>
    </div>
  );
};

export default BillingPage;
