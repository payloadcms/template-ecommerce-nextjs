import { LINK_FIELDS } from "./link";
import { MEDIA } from "./media";
import { META } from "./meta";

export const CALL_TO_ACTION = `
...on Cta {
  blockType
  ctaBackgroundColor
  richText
  links {
    link ${LINK_FIELDS()}
  }
}
`

export const CONTENT = `
...on Content {
  blockType
  contentBackgroundColor
  layout
  columnOne {
    richText
    enableLink
    link ${LINK_FIELDS()}
  }
  columnTwo {
    richText
    enableLink
    link ${LINK_FIELDS()}
  }
  columnThree {
    richText
    enableLink
    link ${LINK_FIELDS()}
  }
}
`

export const MEDIA_BLOCK = `
...on MediaBlock {
  blockType
  mediaBlockBackgroundColor
  position
  ${MEDIA}
}
`

export const ARCHIVE_BLOCK = `
...on Archive {
  blockType
  populateBy
  relationTo
  categories {
    id
  }
  limit
  selectedDocs {
    relationTo
    value {
      ...on Product {
        id
        slug
        title
      }
    }
  }
  populatedDocs {
    relationTo
    value {
      ...on Product {
        id
        slug
        title
        ${META}
      }
    }
  }
  populatedDocsTotal
}
`
