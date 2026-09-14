import { expect, it } from "vitest";
import { mapProfile } from "./profile-mapper";
const dto = { id: 1, name: "Ana", surname: "Pérez", email: "ana@example.com", role: "admin", calendar_connection_status: "disconnected", secret: "private" };
it("maps an administrator without address or category and excludes additional data", () => {
  expect(mapProfile(dto)).toEqual({ id: 1, firstName: "Ana", lastName: "Pérez", email: "ana@example.com", role: "admin" });
});
it.each([null, {}, { ...dto, id: 1.5 }, { ...dto, name: "" }, { ...dto, role: "owner" }, { ...dto, email: 4 }])("rejects incompatible profiles: %j", value => {
  expect(() => mapProfile(value)).toThrow("unavailable");
});
it.each([undefined, "unknown", 5])("rejects incompatible calendar status %j", calendarStatus => {
  expect(() => mapProfile({ ...dto, calendar_connection_status: calendarStatus })).toThrow("unavailable");
});
it("accepts an optional valid photograph without returning it", () => {
  expect(mapProfile({ ...dto, profile_photo: { original_name: "photo.jpg", url: "https://files.example.com/photo.jpg" } })).not.toHaveProperty("profilePhoto");
});
it("rejects malformed optional photographs", () => {
  expect(() => mapProfile({ ...dto, profile_photo: { url: 5 } })).toThrow("unavailable");
});
