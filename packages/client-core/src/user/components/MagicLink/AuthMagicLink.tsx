import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, withRouter } from 'react-router-dom'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import { AuthService } from '../../services/AuthService'
import { useAuthState } from '../../services/AuthService'
import ResetPassword from '../Auth/ResetPassword'
import { VerifyEmail } from '../Auth/VerifyEmail'

interface Props {
  auth: any
  type: string
  token: string
}

const AuthMagicLink = (props: Props): any => {
  const { auth, token, type } = props
  const { t } = useTranslation()

  useEffect(() => {
    if (type === 'login') {
      AuthService.loginUserByJwt(token, '/', '/')
    } else if (type === 'connection') {
      const user = useAuthState().user
      if (user !== null) {
        AuthService.refreshConnections(user.id.value!)
      }
      window.location.href = '/profile-connections'
    }
  }, [])

  return (
    <Container component="main" maxWidth="md">
      <Box mt={3}>
        <Typography variant="body2" color="textSecondary" align="center">
          {t('user:magikLink.wait')}
        </Typography>
      </Box>
    </Container>
  )
}

const AuthMagicLinkWrapper = (props: any): any => {
  const search = new URLSearchParams(useLocation().search)
  const token = search.get('token') as string
  const type = search.get('type') as string

  const handleResetPassword = (token: string, password: string): any => {
    AuthService.resetPassword(token, password)
  }

  if (type === 'verify') {
    return <VerifyEmail {...props} type={type} token={token} />
  } else if (type === 'reset') {
    return <ResetPassword resetPassword={handleResetPassword} type={type} token={token} />
  }
  return <AuthMagicLink {...props} token={token} type={type} />
}

export default withRouter(AuthMagicLinkWrapper)
