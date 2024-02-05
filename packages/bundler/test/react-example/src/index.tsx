import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'

import { isObject } from './utils'

import styles from './index.module.less'

const Component: React.FC<{ title: string }> = (props) => {
  return <h1 className={styles.title}>{props.title}</h1>
}

const App = () => {
  useEffect(() => {
    console.log('hello bundler!!!')
  }, [])

  useEffect(() => {
    let a
    let b = a ?? 1
    console.log(isObject(b))
  }, [])
  
  return (
    <>
      <Component title='hello bundler!!!' />
    </>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)
