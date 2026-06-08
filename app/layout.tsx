import '../styles/core.css'
import '../styles/profile.css'
import '../styles/footer.css'
import '../styles/home-page.css'
import '../styles/feedback-form.css'
import '../styles/toast-custom.css'
import '../styles/effects.css'

import { ThemeProvider } from 'next-themes'
import localFont from 'next/font/local'
import ClientApp from './clientApp'
import { Providers } from './providers/SessionProvider'
import QueryProvider from './providers/QueryProvider'
import { NotificationProvider } from './components/NotificationProvider'
import { SoundProvider } from './components/SoundManager'
import ClientSideComponents from './components/ClientSideComponents'
import RainSplashes from './components/RainSplashes'

const homeFont = localFont({
  src: './fonts/bleedingcowboysrus.ttf',
  display: 'swap',
  variable: '--font-home',
})

const secondFont = localFont({
  src: './fonts/Neuzeit-Antiqua.ttf',
  display: 'swap',
  variable: '--font-second',
})

export const metadata = {
  title: 'BY_OWL',
  description: 'Сайт стримера BY_OWL',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="preload" as="image" href="/images/archive-background.png" />
      </head>

      <body className={`${homeFont.variable} ${secondFont.variable} home-font`}>
        <div className="rain">
          {Array.from({ length: 13 }).map((_, i) => (
            <span key={i}></span>
          ))}
        </div>

        <RainSplashes />

        <ThemeProvider
          attribute="data-theme"
          defaultTheme="twilight"
          themes={['twilight', 'daylight']}
          enableSystem={false}
          storageKey="site-theme"
        >
          <QueryProvider>
            <Providers>
              <NotificationProvider>
                <SoundProvider>
                  
                  <ClientApp>
                    {children}
                  </ClientApp>

                  <ClientSideComponents />
                </SoundProvider>
              </NotificationProvider>
            </Providers>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}