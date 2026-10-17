export type Category = Readonly<{
  id: number;
  name: string;
  enabled?: boolean;
  /** Create responses do not include a version; list and edit responses do. */
  version?: number;
}>;

