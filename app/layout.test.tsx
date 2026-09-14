import { expect, it } from "vitest";
import { metadata } from "./layout";

it("describes the administrator entry in Spanish", () => {
  expect(metadata.title).toBe("Lo Resuelvo · Administración");
  expect(metadata.description).toBe("Accedé al espacio de administración de Lo Resuelvo.");
});
