import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  boards: defineTable({
    ownerUserId: v.id("users"),
    orgId: v.optional(v.id("orgs")),
    title: v.string(),
    description: v.optional(v.string()),
    settingsJson: v.optional(v.string()),
    defaultApiKeyId: v.optional(v.id("apiKeys")),
    isPublic: v.boolean(),
    // ACL fields for least-privilege access
    permissions: v.optional(v.object({
      canView: v.array(v.id("users")),
      canEdit: v.array(v.id("users")),
      canAdmin: v.array(v.id("users")),
    })),
    // Security metadata
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Audit trail
    lastAccessedAt: v.optional(v.number()),
    lastAccessedBy: v.optional(v.id("users")),
  })
    .index("by_owner", ["ownerUserId"])
    .index("by_created", ["createdBy"])
    .index("by_public", ["isPublic"]),

  nodes: defineTable({
    boardId: v.id("boards"),
    type: v.union(v.literal("prompt"), v.literal("message"), v.literal("response"), v.literal("note"), v.literal("frame")),
    role: v.optional(v.union(v.literal("user"), v.literal("assistant"))),
    title: v.optional(v.string()),
    content: v.string(),
    position: v.object({
      x: v.number(),
      y: v.number(),
    }),
    size: v.optional(v.object({
      width: v.number(),
      height: v.number(),
    })),
    collapsed: v.boolean(),
    color: v.optional(v.string()),
    meta: v.object({
      model: v.optional(v.string()),
      provider: v.optional(v.string()),
      tokens: v.optional(v.object({
        input: v.number(),
        output: v.number(),
      })),
      sources: v.optional(v.array(v.object({
        url: v.string(),
        title: v.string(),
        at: v.number(),
      }))),
    }),
    // Security metadata
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Audit trail
    lastAccessedAt: v.optional(v.number()),
    lastAccessedBy: v.optional(v.id("users")),
  })
    .index("by_board", ["boardId"])
    .index("by_created", ["createdBy"]),

  edges: defineTable({
    boardId: v.id("boards"),
    srcNodeId: v.id("nodes"),
    dstNodeId: v.id("nodes"),
    kind: v.union(v.literal("lineage"), v.literal("reference")),
    label: v.optional(v.string()),
    // Security metadata
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_board", ["boardId"])
    .index("by_src", ["srcNodeId"])
    .index("by_dst", ["dstNodeId"])
    .index("by_created", ["createdBy"]),

  tags: defineTable({
    boardId: v.id("boards"),
    name: v.string(),
    color: v.string(),
    // Security metadata
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_board", ["boardId"])
    .index("by_created", ["createdBy"]),

  nodeTags: defineTable({
    nodeId: v.id("nodes"),
    tagId: v.id("tags"),
    // Security metadata
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_node", ["nodeId"])
    .index("by_tag", ["tagId"])
    .index("by_created", ["createdBy"]),

  snapshots: defineTable({
    boardId: v.id("boards"),
    label: v.string(),
    graphJson: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_board", ["boardId"])
    .index("by_created", ["createdBy"]),

  apiKeys: defineTable({
    ownerUserId: v.id("users"),
    provider: v.union(v.literal("openai"), v.literal("anthropic"), v.literal("google")),
    nickname: v.string(),
    last4: v.string(),
    encryptedKey: v.string(),
    status: v.union(v.literal("active"), v.literal("revoked")),
    // Security metadata
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Audit trail
    lastUsedAt: v.optional(v.number()),
    lastUsedBy: v.optional(v.id("users")),
  })
    .index("by_owner", ["ownerUserId"])
    .index("by_created", ["createdBy"])
    .index("by_status", ["status"]),

  usageEvents: defineTable({
    userId: v.id("users"),
    boardId: v.id("boards"),
    nodeId: v.optional(v.id("nodes")),
    provider: v.string(),
    model: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    costEstimate: v.number(),
    status: v.string(),
    // Security metadata
    createdAt: v.number(),
    sessionId: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_board", ["boardId"])
    .index("by_created", ["createdAt"]),

  sharingTokens: defineTable({
    boardId: v.id("boards"),
    token: v.string(),
    access: v.union(v.literal("view"), v.literal("comment")),
    expiresAt: v.number(),
    // Security metadata
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Audit trail
    lastAccessedAt: v.optional(v.number()),
    lastAccessedBy: v.optional(v.id("users")),
    accessCount: v.number(),
    maxAccesses: v.optional(v.number()),
  })
    .index("by_board", ["boardId"])
    .index("by_token", ["token"])
    .index("by_created", ["createdBy"])
    .index("by_expires", ["expiresAt"]),

  // Audit log for security monitoring
  auditLog: defineTable({
    userId: v.optional(v.id("users")),
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.optional(v.string()),
    success: v.boolean(),
    details: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_action", ["action"])
    .index("by_resource", ["resourceType", "resourceId"])
    .index("by_created", ["createdAt"])
    .index("by_success", ["success"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
