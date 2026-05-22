import { useEffect } from 'react'
import Head from 'next/head'
import '../styles/globals.css'
import Header from '../components/Header'
import Layout from '../components/Layout'
import { useRouter } from 'next/router'
import { DarkModeProvider } from '../contexts/DarkModeContext'

export default function App({ Component, pageProps }) {
    const router = useRouter()

    useEffect(() => {
        const handleRouteChangeComplete = () => {
            const hash = window.location.hash
            if (hash) {
                const element = document.querySelector(hash)
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' })
                }
            }
        }
        router.events.on('routeChangeComplete', handleRouteChangeComplete)
        return () => {
            router.events.off('routeChangeComplete', handleRouteChangeComplete)
        }
    }, [router.events])

    return (
        <DarkModeProvider>
            <Head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/png" href="/favicon.png" />
            </Head>
            <Header />
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </DarkModeProvider>
    )
}
