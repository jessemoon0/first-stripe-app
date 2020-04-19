export interface ICheckoutSessionBaseConfig {
  success_url: string;
  cancel_url: string;
  payment_method_types: string[];
  client_reference_id: string;
  // If the customer has already made a purchase before, the firebase ID will be attached to the stripe ID
  // This allows for a customer to have multiple products under his name on the stripe server.
  customer?: string;
  // This is the way we send products to Stripe
  line_items?: IStripeProduct[];
  // This is the way we make subscriptions on Stripe
  subscription_data?: IStripeSubscription;
}

export interface IStripeProduct {
  name: string;
  description: string;
  amount: number;
  currency: string;
  quantity: number;
}

export interface IStripeSubscription {
  items: IStripeSubscriptionPlan[];
}

export interface IStripeSubscriptionPlan {
  plan: string;
}
