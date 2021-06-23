import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Steven Speicher</title>
        <meta name="description" content="Steven Speicher is a web engineer in the Pacific Northwest. He makes web things and other multimedia stuff." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Steven Speicher
        </h1>
      </main>

      <footer className={styles.footer}>

      </footer>
    </div>
  )
}
