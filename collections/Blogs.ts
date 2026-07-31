import type { CollectionConfig } from "payload";
import { slugField } from "payload";

export const Blogs: CollectionConfig = {
  slug: "blogs",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedDate", "_status"],
  },
  versions: {
    drafts: true,
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return {
        _status: {
          equals: "published",
        },
      };
    },
  },
  hooks: {
    afterChange: [
      async ({ doc }) => {
        try {
          const { revalidatePath } = await import("next/cache");
          revalidatePath("/blogs/");
          if (doc?.slug) {
            revalidatePath(`/${doc.slug}/`);
          }
        } catch {
          // Ignore outside Next.js request context
        }
        return doc;
      },
    ],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    slugField({
      name: "slug",
      useAsSlug: "title",
      required: true,
      overrides: (field) => {
        // Keep slug under Title in the main column (not sidebar)
        if (field.admin) {
          delete field.admin.position;
        }
        return field;
      },
    }),
    {
      name: "excerpt",
      type: "textarea",
      required: true,
      admin: {
        description: "Short summary shown on the Insights blog card.",
      },
    },
    {
      name: "category",
      type: "select",
      required: true,
      defaultValue: "ai-insights",
      options: [
        { label: "AI Insights", value: "ai-insights" },
        { label: "Growth Insights", value: "growth-insights" },
      ],
    },
    {
      name: "content",
      type: "richText",
      required: true,
    },
    {
      name: "author",
      type: "text",
      required: true,
      defaultValue: "Dr. Brad",
    },
    {
      name: "authorAvatar",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Optional. Defaults to the existing author avatar style if empty.",
      },
    },
    {
      name: "publishedDate",
      type: "date",
      required: true,
      admin: {
        date: {
          pickerAppearance: "dayOnly",
          displayFormat: "MMMM d, yyyy",
        },
      },
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: "imageUrl",
      type: "text",
      label: "Image URL",
      admin: {
        description:
          "Direct image URL for the Insights card and full blog page. Used when set; otherwise the uploaded Featured Image is used.",
      },
      validate: (value, { data }) => {
        const hasUrl = typeof value === "string" && value.trim().length > 0;
        const hasUpload = Boolean(data?.featuredImage);
        if (!hasUrl && !hasUpload) {
          return "Provide an Image URL or upload a Featured Image.";
        }
        return true;
      },
    },
    {
      name: "featuredImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Upload an image for the Insights card and full blog page. Optional if Image URL is provided.",
      },
    },
  ],
};
