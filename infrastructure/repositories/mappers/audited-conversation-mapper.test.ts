import { describe, expect, it } from "vitest";
import { mapAuditedConversation } from "./operation-mapper";

const page = {
  operation_id: "jr-101",
  conversation_id: 9,
  job_request_id: 101,
  service_proposal_id: 41,
  related_service_proposal_ids: [41],
  shared_conversation: false,
  next_cursor: "signed-next-page",
  messages: [{
    id: 31, sender_role: "consumer", content: "Visita", created_on: "2026-09-20T13:05:00Z",
    images: [{ id: "7fa39a45-2466-4c11-a640-a295dd748158", url: "https://example.com/image?signature=private", original_name: "foto.jpg" }],
    audio: { id: "7fa39a45-2466-4c11-a640-a295dd748159", url: "https://example.com/audio", original_name: "audio.ogg", mime_type: "audio/ogg", codec: "opus", duration_seconds: 15 },
    video: { id: "7fa39a45-2466-4c11-a640-a295dd748160", url: "https://example.com/video", original_name: "video.mp4", mime_type: "video/mp4", video_codec: "h264", duration_seconds: 15, width: 640, height: 480 },
  }],
};

describe("mapAuditedConversation current API contract", () => {
  it("maps messages, private media UUIDs and continuation cursor without inventing a sender ID", () => {
    const result = mapAuditedConversation(page);
    expect(result.nextCursor).toBe("signed-next-page");
    expect(mapAuditedConversation({ ...page, shared_conversation: true }).sharedConversation).toBe(true);
    expect(result.items[0]).toMatchObject({ id: 31, senderRole: "consumer", content: "Visita", sentAt: "2026-09-20T13:05:00Z" });
    expect(result.items[0].senderId).toBeUndefined();
    expect(result.items[0].attachments.map((item) => item.fileName)).toEqual(["foto.jpg", "audio.ogg", "video.mp4"]);
    expect(result.items[0].attachments[0].id).toBe("7fa39a45-2466-4c11-a640-a295dd748158");
  });

  it("accepts a valid empty page and rejects malformed messages instead of a legacy payload", () => {
    expect(mapAuditedConversation({ ...page, messages: [], next_cursor: null })).toMatchObject({ items: [], nextCursor: null });
    expect(() => mapAuditedConversation({ ...page, messages: [{ id: 31 }] })).toThrow();
    expect(() => mapAuditedConversation({ items: [] })).toThrow();
  });
});
