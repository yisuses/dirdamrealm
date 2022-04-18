import styled from '@emotion/styled'

export const LogoContainer = styled.div`
  .desktop {
    display: none;
  }
  .mobile {
    display: inline-block;
  }

  ${({ theme }) => theme.media.up.lg} {
    .desktop {
      display: inline-block;
    }
    .mobile {
      display: none;
    }
  }
`
