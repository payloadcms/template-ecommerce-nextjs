import { AppProps } from 'next/app';
import { GridProvider } from '@faceless-ui/css-grid';
import { ModalContainer, ModalProvider } from '@faceless-ui/modal';
import React, { useCallback } from 'react';
import { Header as HeaderType, Footer as FooterType } from '../payload-types';
import cssVariables from '../cssVariables';
import { AdminBar } from '../components/AdminBar';
import { AuthProvider } from '../providers/Auth';
import { useRouter } from 'next/router';
import { Header } from '../components/Header';
import { CartProvider } from '../providers/Cart';
import { Footer } from '../components/Footer';

import '../css/app.scss';

const PayloadApp = (
  appProps: AppProps<{
    id: string
    preview: boolean
    collection: string
    header: HeaderType
    footer: FooterType
  }>
): React.ReactElement => {
  const {
    Component,
    pageProps,
  } = appProps;

  const {
    collection,
    id,
    preview,
  } = pageProps;

  const router = useRouter();

  const onPreviewExit = useCallback(() => {
    const exit = async () => {
      const exitReq = await fetch('/api/exit-preview');
      if (exitReq.status === 200) {
        router.reload();
      }
    }
    exit();
  }, [router])

  return (
    <AuthProvider>
      <CartProvider>
        <GridProvider
          breakpoints={{
            s: cssVariables.breakpoints.s,
            m: cssVariables.breakpoints.m,
            l: cssVariables.breakpoints.l,
          }}
          colGap={{
            s: '24px',
            m: '48px',
            l: '48px',
            xl: '72px',
          }}
          cols={{
            s: 4,
            m: 4,
            l: 12,
            xl: 12,
          }}
        >
          <ModalProvider transTime={0} zIndex="var(--modal-z-index)">
            <AdminBar
              adminBarProps={{
                collection,
                id,
                preview,
                onPreviewExit,
              }}
            />
            <Header header={pageProps.header} />
            <Component {...pageProps} />
            <Footer footer={pageProps.footer} />
            <ModalContainer />
          </ModalProvider>
        </GridProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default PayloadApp
