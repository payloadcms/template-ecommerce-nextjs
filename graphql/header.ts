import { gql } from "@apollo/client";
import { HEADER } from "./globals";

export const QUERY_HEADER = gql`
query Header {
  ${HEADER}
}
`
