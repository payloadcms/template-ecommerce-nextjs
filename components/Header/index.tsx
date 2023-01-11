import { ModalToggler } from '@faceless-ui/modal';
import Link from 'next/link';
import React from 'react';
import { Header as HeaderType } from '../../payload-types';
import { Gutter } from '../Gutter';
import { MenuIcon } from '../icons/Menu';
import { CMSLink } from '../Link';
import { Logo } from '../Logo';
import { MobileMenuModal, slug as menuModalSlug } from './MobileMenuModal';

import classes from './index.module.scss';
import { useAuth } from '../../providers/Auth';

type HeaderBarProps = {
  children?: React.ReactNode;
}
export const HeaderBar: React.FC<HeaderBarProps> = ({ children }) => {
  return (
    <header className={classes.header}>
      <Gutter className={classes.wrap}>
        <Link href="/">
          <a>
            <Logo />
          </a>
        </Link>
        {children}
        <ModalToggler slug={menuModalSlug} className={classes.mobileMenuToggler}>
          <MenuIcon />
        </ModalToggler>
      </Gutter>
    </header>
  )
}

export const Header: React.FC<{ header: HeaderType }> = ({ header }) => {
  const navItems = header?.navItems || [];
  const { user } = useAuth();

  return (
    <>
      <HeaderBar>
        <nav className={classes.nav}>
          {navItems.map(({ link }, i) => {
            return (
              <CMSLink key={i} {...link} />
            )
          })}
          {user && (
            <React.Fragment>
              <Link href="/account">
                <a>Account</a>
              </Link>
              <Link href="/logout">
                <a>Logout</a>
              </Link>
            </React.Fragment>
          )}
          {!user && (
            <React.Fragment>
              <Link href="/login">
                <a>Login</a>
              </Link>
              <Link href="/create-account">
                <a>Create Account</a>
              </Link>
            </React.Fragment>
          )}
        </nav>
      </HeaderBar>
      <MobileMenuModal navItems={navItems} />
    </>
  )
}
