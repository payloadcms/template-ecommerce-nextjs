import { ModalToggler } from '@faceless-ui/modal';
import Link from 'next/link';
import React from 'react';
import { Header as HeaderType } from '../../payload-types';
import { Gutter } from '../Gutter';
import { MenuIcon } from '../icons/Menu';
import { CMSLink } from '../Link';
import { Logo } from '../Logo';
import { MobileMenuModal, slug as menuModalSlug } from './MobileMenuModal';
import { useAuth } from '../../providers/Auth';
import { CartLink } from '../CartLink';
import classes from './index.module.scss';

export const Header: React.FC<{ header: HeaderType }> = ({ header }) => {
  const navItems = header?.navItems || [];
  const { user } = useAuth();

  return (
    <>
      <header className={classes.header}>
        <Gutter className={classes.wrap}>
          <Link href="/">
            <Logo />
          </Link>
          <nav className={classes.nav}>
            {navItems.map(({ link }, i) => {
              return (
                <CMSLink key={i} {...link} />
              )
            })}
            {user && (
              <React.Fragment>
                <Link href="/account">
                  Account
                </Link>
                <Link href="/logout">
                  Logout
                </Link>
              </React.Fragment>
            )}
            {!user && (
              <React.Fragment>
                <Link href="/login">
                  Login
                </Link>
                <Link href="/create-account">
                  Create Account
                </Link>
              </React.Fragment>
            )}
            <CartLink />
          </nav>
          <ModalToggler slug={menuModalSlug} className={classes.mobileMenuToggler}>
            <MenuIcon />
          </ModalToggler>
        </Gutter>
      </header>
      <MobileMenuModal navItems={navItems} />
    </>
  )
}
