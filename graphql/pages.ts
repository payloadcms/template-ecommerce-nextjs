import { gql } from "@apollo/client";
import { ARCHIVE_BLOCK, CALL_TO_ACTION, CONTENT, MEDIA_BLOCK } from "./blocks";
import { HEADER, FOOTER, SETTINGS } from "./globals";
import { LINK_FIELDS } from "./link";
import { MEDIA } from "./media";
import { META } from "./meta";

export const PAGES = gql`
  query Pages {
    Pages(limit: 300) {
      docs {
        slug
      }
    }
  }
`

export const PAGE = gql`
  query Page($slug: String ) {
    Pages(where: { slug: { equals: $slug}}) {
      docs {
        id
        title
        hero {
          type
          richText
          links {
            link ${LINK_FIELDS()}
          }
          ${MEDIA}
        }
        layout {
          ${CALL_TO_ACTION}
          ${CONTENT}
          ${MEDIA_BLOCK}
          ${ARCHIVE_BLOCK}
        }
        ${META}
      }
    }
    ${HEADER}
    ${FOOTER}
    ${SETTINGS}
  }
`
