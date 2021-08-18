import { useRouter } from 'next/router'

const Product = () => {
  const router = useRouter()
  const { slug } = router.query

  return <p>Product: {slug}</p>
}

export default Product;

/*

    pages/post/create.js - Will match /post/create
    pages/post/[pid].js - Will match /post/1, /post/abc, etc. But not /post/create
    pages/post/[...slug].js - Will match /post/1/2, /post/a/b/c, etc. But not /post/create, /post/abc

*/
