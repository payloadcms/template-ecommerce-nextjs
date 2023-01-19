import React, { useState } from 'react';
import { PayloadMeUser, PayloadAdminBarProps, PayloadAdminBar } from 'payload-admin-bar';
import { Gutter } from '../Gutter';
import classes from './index.module.scss'
import { useAuth } from '../../providers/Auth';

const Title: React.FC = () => (
  <span>
    My Store
  </span>
)

export const AdminBar: React.FC<{
  adminBarProps: PayloadAdminBarProps
}> = (props) => {
  const {
    adminBarProps
  } = props;

  const { user } = useAuth()

  return (
    <div
      className={[
        classes.adminBar,
        user && classes.show
      ].filter(Boolean).join(' ')}
    >
      <Gutter className={classes.blockContainer} >
        <PayloadAdminBar
          {...adminBarProps}
          key={user?.id} // use key to get the admin bar to re-run its `me` request
          cmsURL={process.env.NEXT_PUBLIC_CMS_URL}
          className={classes.payloadAdminBar}
          classNames={{
            user: classes.user,
            logo: classes.logo,
            controls: classes.controls,
          }}
          logo={<Title />}
          style={{
            position: 'relative',
            zIndex: 'unset',
            padding: 0,
            backgroundColor: 'transparent'
          }}
        />
      </Gutter>
    </div>
  )
}
