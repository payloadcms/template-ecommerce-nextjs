import { GetStaticProps, GetStaticPaths } from 'next'
import React from 'react';
import { PRODUCT, PRODUCTS } from '../../graphql/products';
import { Product as ProductType } from '../../payload-types';
import { Blocks } from '../../components/Blocks';
import { getApolloClient } from '../../graphql';
import { ProductHero } from '../../components/Hero/Product';
import { useRouter } from 'next/router';
import { PaywallBlocks } from '../../components/PaywallBlocks';

export const Product: React.FC<{
  product: ProductType
  preview?: boolean
}> = (props) => {
  const {
    product
  } = props;

  const { query } = useRouter();

  if (product) {
    const {
      layout,
      paywall
    } = product;

    return (
      <React.Fragment>
        <ProductHero
          product={product}
        />
        <Blocks blocks={layout} />
        <PaywallBlocks productSlug={query.slug as string} />
      </React.Fragment>
    )
  }

  return null;
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const apolloClient = getApolloClient();

  const { data } = await apolloClient.query({
    query: PRODUCT,
    variables: {
      slug: params?.slug,
    },
  });

  if (!data.Products.docs[0]) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      product: data?.Products?.docs?.[0] || null,
      header: data?.Header || null,
      footer: data?.Footer || null
    },
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const apolloClient = getApolloClient();

  const { data } = await apolloClient.query({
    query: PRODUCTS,
  });

  return {
    paths: data.Products.docs.map(({ slug }) => ({
      params: { slug },
    })),
    fallback: 'blocking',
  };
}

export default Product
