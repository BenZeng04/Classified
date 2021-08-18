import { useRouter } from 'next/router'

const Purchase = () => {
  const router = useRouter()
  const { slug } = router.query

  return <p>Purchase: {slug}</p>
}

export default Purchase;
