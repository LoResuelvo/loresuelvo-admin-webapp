export type CategoryImpact = Readonly<{
  categoryId: number;
  categoryName: string;
  providerCount: number;
  activeOrdersCount: number;
  canDeactivate: boolean;
}>;
