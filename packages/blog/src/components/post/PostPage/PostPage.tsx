import parseISO from 'date-fns/parseISO'
import { useTranslation } from 'next-i18next'

import { HeaderImage, Metadata } from '@components/common'

export interface PostPageProps {
  post: Post
}

export function PostPage({ post }: PostPageProps) {
  const { t } = useTranslation('postPage')
  //TODO ldjson

  return (
    <>
      <Metadata name={t('postPage.title', { postName: post.title })} description={post.summary} />

      <HeaderImage
        imgSrc={post.coverImage?.url || post.imgUrl || 'https://picsum.photos/1440/600'}
        date={parseISO(post.publishedAt)}
        categories={post.categories || []}
        title={post.title}
        subtitle={post.summary}
      />
    </>
  )
}
