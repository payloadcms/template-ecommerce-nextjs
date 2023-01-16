import { GetStaticProps, GetStaticPaths } from 'next'
import React from 'react';
import { PRODUCT, PRODUCTS } from '../../graphql/products';
import { Product } from '../../payload-types';
import Blocks from '../../components/Blocks';
import { Hero } from '../../components/Hero';
import { getApolloClient } from '../../graphql';
import { ProductHero } from '../../components/Hero/Product';

const ProductTemplate: React.FC<{
  product: Product
  preview?: boolean
}> = (props) => {
  const {
    product
  } = props;

  if (product) {
    const {
      layout,
    } = product;

    return (
      <React.Fragment>
        <ProductHero
          product={product}
        />
        <Blocks blocks={layout} />
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

export default ProductTemplate;
