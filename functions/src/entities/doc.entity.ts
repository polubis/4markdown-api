interface DocEntityField {
  id: string;
  name: string;
  code: string;
}

interface DocEntity {
  fields: DocEntityField[];
}

export type { DocEntity, DocEntityField };
