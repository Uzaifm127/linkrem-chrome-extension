export interface SessionLinkData {
  name: string;
  links: Array<{ name: string; url: string }>;
}

export interface Link {
  id: string;
  name: string;
  url: string;
  tags: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tagName: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  sessionLinksId: string | null;
}

export interface SessionLink {
  id: string;
  name: string;
  links: Array<Omit<Link, "tags">>;
  createdAt: Date;
  updatedAt: Date;
}
