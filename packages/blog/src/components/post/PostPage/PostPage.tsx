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

      <HeaderImage post={post} />
    </>
  )
}
