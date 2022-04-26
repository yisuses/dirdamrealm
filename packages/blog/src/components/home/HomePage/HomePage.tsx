import { parseISO } from 'date-fns'
import { useTranslation } from 'next-i18next'
import { Metadata } from '@/components/common'
import { HeaderImage } from '../HeaderImage'
import { LastPosts } from '../LastPosts'

export type HeaderPostProps = {
  imgUrl: string
  date: string
  title: string
  subtitle: string
  categories: ECategoryCode[]
}

export interface HomePageProps {
  headerPost?: HeaderPostProps
  lastEntries: Post[]
}
export function HomePage({ headerPost, lastEntries }: HomePageProps) {
  const { t } = useTranslation('homePage')
  return (
    <>
      <Metadata name={t('homePage.title')} description={t('homePage.description')} />
      {headerPost ? (
        <HeaderImage
          imgSrc={headerPost.imgUrl}
          date={parseISO(headerPost.date)}
          categories={headerPost.categories}
          title={headerPost.title}
          subtitle={headerPost.subtitle}
        />
      ) : (
        <div>{t('homePage.noPublishedArticles')}</div>
      )}
      <LastPosts posts={lastEntries} />
    </>
  )
}
