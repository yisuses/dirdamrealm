import type { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/',
      permanent: true,
    },
  }
}

const Index = () => <div />

export default Index
