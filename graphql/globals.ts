import { gql } from '@apollo/client';
import { ARCHIVE_BLOCK, CALL_TO_ACTION, CONTENT, MEDIA_BLOCK } from './blocks';
import { LINK_FIELDS } from './link';
import { MEDIA } from './media';

export const HEADER = `
  Header {
    navItems {
      link ${LINK_FIELDS({ disableAppearance: true })}
		}
  }
`;

export const HEADER_QUERY = gql`
query Header {
  ${HEADER}
}
`

export const FOOTER = `
  Header {
    navItems {
      link ${LINK_FIELDS({ disableAppearance: true })}
		}
  }
`;

export const FOOTER_QUERY = gql`
query Header {
  ${FOOTER}
}
`

export const CART = `
  CartPage {
    shopPage {
      slug
    }
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
  }
`;

export const CART_QUERY = gql`
query CartPage {
  ${CART}
}
`
