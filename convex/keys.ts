import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const addApiKey = mutation({
  args: {
    provider: v.union(v.literal("openai"), v.literal("anthropic"), v.literal("google")),
    nickname: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Validate the API key with a test call
    const isValid = await validateApiKey(args.provider, args.secret);
    if (!isValid) {
      throw new Error("Invalid API key");
    }

    // Encrypt the key (placeholder - would use actual encryption)
    const encryptedKey = await encryptApiKey(args.secret);
    const last4 = args.secret.slice(-4);

    const keyId = await ctx.db.insert("apiKeys", {
      ownerUserId: userId,
      provider: args.provider,
      nickname: args.nickname,
      last4,
      encryptedKey,
      status: "active",
      updatedAt: Date.now(),
    });

    return keyId;
  },
});

export const listApiKeys = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const keys = await ctx.db
      .query("apiKeys")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Return without encrypted keys
    return keys.map(key => ({
      _id: key._id,
      provider: key.provider,
      nickname: key.nickname,
      last4: key.last4,
      status: key.status,
      _creationTime: key._creationTime,
    }));
  },
});

export const revokeApiKey = mutation({
  args: { keyId: v.id("apiKeys") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const key = await ctx.db.get(args.keyId);
    if (!key || key.ownerUserId !== userId) {
      throw new Error("API key not found or access denied");
    }

    await ctx.db.patch(args.keyId, {
      status: "revoked",
      updatedAt: Date.now(),
    });
  },
});

async function validateApiKey(provider: string, secret: string): Promise<boolean> {
  // Placeholder validation - would make actual API call
  if (provider === "openai") {
    return secret.startsWith("sk-") && secret.length > 20;
  }
  return true;
}

async function encryptApiKey(secret: string): Promise<string> {
  // Placeholder encryption - would use actual AES-GCM
  // Using btoa/atob for base64 encoding in Convex environment
  return btoa(secret);
}

export async function decryptApiKey(encryptedKey: string): Promise<string> {
  // Placeholder decryption - would use actual AES-GCM
  // Using btoa/atob for base64 decoding in Convex environment
  return atob(encryptedKey);
}

export const getApiKey = internalQuery({
  args: { keyId: v.id("apiKeys") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.keyId);
  },
});
