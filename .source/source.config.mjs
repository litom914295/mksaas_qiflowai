// source.config.ts
import {
  defineCollections,
  defineDocs,
  frontmatterSchema,
  metaSchema
} from "fumadocs-mdx/config";
import { z } from "zod";
var docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema.extend({
      preview: z.string().optional(),
      index: z.boolean().default(false)
    })
  },
  meta: {
    schema: metaSchema.extend({
      description: z.string().optional()
    })
  }
});
var changelog = defineCollections({
  type: "doc",
  dir: "content/changelog",
  schema: frontmatterSchema.extend({
    version: z.string(),
    date: z.string().date(),
    published: z.boolean().default(true)
  })
});
var pages = defineCollections({
  type: "doc",
  dir: "content/pages",
  schema: frontmatterSchema.extend({
    date: z.string().date(),
    published: z.boolean().default(true)
  })
});
var author = defineCollections({
  type: "doc",
  dir: "content/author",
  schema: frontmatterSchema.extend({
    name: z.string(),
    avatar: z.string()
  })
});
var category = defineCollections({
  type: "doc",
  dir: "content/category",
  schema: frontmatterSchema.extend({
    name: z.string()
  })
});
var blog = defineCollections({
  type: "doc",
  dir: "content/blog",
  schema: frontmatterSchema.extend({
    image: z.string(),
    date: z.string().date(),
    published: z.boolean().default(true),
    categories: z.array(z.string()),
    author: z.string()
  })
});
export {
  author,
  blog,
  category,
  changelog,
  docs,
  pages
};
