import Link from 'next/link';
import React from 'react';
import { Footer as FooterType } from '../../payload-types';
import { CMSLink } from '../Link';
import { useAuth } from '../../providers/Auth';
import { CartLink } from '../CartLink';
import classes from './index.module.scss';
import { Gutter } from '../Gutter';
import { Logo } from '../Logo';

export const Footer: React.FC<{ footer: FooterType }> = ({ footer }) => {
  const navItems = footer?.navItems || [];
  const { user } = useAuth();

  return (
    <footer className={classes.footer}>
      <Gutter className={classes.wrap}>
        <Link href="/">
          <Logo color="white" />
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
      </Gutter>
    </footer>
  )
}
