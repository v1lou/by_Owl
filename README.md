
```
by_owl
├─ AGENTS.md
├─ app
│  ├─ 118n.ts
│  ├─ admin
│  │  ├─ analytics
│  │  │  └─ page.tsx
│  │  ├─ archive
│  │  │  └─ page.tsx
│  │  ├─ cosplay
│  │  │  └─ page.tsx
│  │  ├─ feedback
│  │  │  ├─ page.tsx
│  │  │  └─ trash
│  │  │     └─ page.tsx
│  │  ├─ full-edit
│  │  │  └─ page.tsx
│  │  ├─ movie-suggestions
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  └─ users
│  │     └─ page.tsx
│  ├─ api
│  │  ├─ admin
│  │  │  └─ check
│  │  │     └─ route.ts
│  │  ├─ analytics
│  │  │  └─ route.ts
│  │  ├─ auth
│  │  │  └─ [...nextauth]
│  │  │     └─ route.ts
│  │  ├─ data
│  │  │  ├─ archive
│  │  │  │  └─ route.ts
│  │  │  ├─ bio
│  │  │  │  └─ route.ts
│  │  │  ├─ cosplays
│  │  │  │  └─ route.ts
│  │  │  ├─ pc-config
│  │  │  │  └─ route.ts
│  │  │  └─ socials
│  │  │     └─ route.ts
│  │  ├─ feedback
│  │  │  ├─ delete
│  │  │  │  └─ route.ts
│  │  │  ├─ empty-trash
│  │  │  │  └─ route.ts
│  │  │  ├─ read
│  │  │  │  └─ route.ts
│  │  │  ├─ restore
│  │  │  │  └─ route.ts
│  │  │  ├─ route.ts
│  │  │  └─ trash
│  │  │     └─ route.ts
│  │  ├─ movie-suggestions
│  │  │  └─ route.ts
│  │  ├─ owl-chat
│  │  │  ├─ admin-status
│  │  │  │  └─ route.ts
│  │  │  ├─ refresh-cache
│  │  │  │  └─ route.ts
│  │  │  └─ route.ts
│  │  ├─ streams
│  │  │  └─ route.ts
│  │  ├─ twitch
│  │  │  ├─ route.ts
│  │  │  └─ stats
│  │  │     └─ route.ts
│  │  ├─ twitch-badges
│  │  │  └─ route.ts
│  │  ├─ update-data
│  │  │  └─ route.ts
│  │  ├─ upload
│  │  │  └─ route.ts
│  │  ├─ users
│  │  │  └─ route.ts
│  │  └─ visitor
│  │     └─ route.ts
│  ├─ archive
│  │  └─ page.tsx
│  ├─ clientApp.tsx
│  ├─ components
│  │  ├─ AlienObserver.tsx
│  │  ├─ ArchiveView.tsx
│  │  ├─ ClickEffect.tsx
│  │  ├─ ClientSideComponents.tsx
│  │  ├─ CommunityLinks.tsx
│  │  ├─ ConfigSection.tsx
│  │  ├─ CosplayGallery.tsx
│  │  ├─ ExportAnalytics.tsx
│  │  ├─ FeedbackForm.tsx
│  │  ├─ Footer.tsx
│  │  ├─ HeroSection.tsx
│  │  ├─ ImageSlider.tsx
│  │  ├─ LanguageSwitcher.tsx
│  │  ├─ MerchSection.tsx
│  │  ├─ MovieSuggestionForm.tsx
│  │  ├─ MusicPlayer.tsx
│  │  ├─ NotificationProvider.tsx
│  │  ├─ ObserverCharacter.tsx
│  │  ├─ OwlAssistant.tsx
│  │  ├─ PageTransition.tsx
│  │  ├─ RainSplashes.tsx
│  │  ├─ Scroll.tsx
│  │  ├─ SocialsSection.tsx
│  │  ├─ SoundManager.tsx
│  │  ├─ SoundToggle.tsx
│  │  ├─ SpeechBubble.tsx
│  │  ├─ StreamNotification.tsx
│  │  ├─ StreamsSection.tsx
│  │  ├─ TestNotificationsButton.tsx
│  │  ├─ ThemeSwitcher.tsx
│  │  └─ TwitchStats.tsx
│  ├─ favicon.ico
│  ├─ fonts
│  │  ├─ bleedingcowboysrus.ttf
│  │  ├─ Neuzeit-Antiqua.ttf
│  │  └─ TwilightC-Regular.ttf
│  ├─ layout.tsx
│  ├─ login
│  │  └─ page.tsx
│  ├─ page.tsx
│  ├─ profile
│  │  └─ page.tsx
│  ├─ providers
│  │  ├─ QueryProvider.tsx
│  │  └─ SessionProvider.tsx
│  └─ test-resend
│     └─ route.ts
├─ CLAUDE.md
├─ eslint.config.mjs
├─ hooks
│  ├─ useAdmin.ts
│  ├─ useEditMode.ts
│  ├─ usePermission.ts
│  ├─ useStreamNotifications.ts
│  ├─ useThemeImage.ts
│  └─ useVisitorTracking.ts
├─ ip-limits.json
├─ lib
│  ├─ checkAdmin.ts
│  ├─ ipLimit.ts
│  ├─ prisma.ts
│  ├─ siteParser.ts
│  ├─ streamerData.ts
│  ├─ streamerKnowledge.ts
│  └─ visitorML.ts
├─ locales
│  ├─ en.ts
│  └─ ru.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ dev.db
│  ├─ migrations
│  │  ├─ 20260511200826_init
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  ├─ schema.prisma
│  └─ seed.ts
├─ prisma.config.ts.backup
├─ proxy.ts
├─ proxy.ts.backup
├─ public
│  ├─ audio
│  │  └─ quotes
│  └─ images
│     ├─ arrow_left.png
│     ├─ arrow_right.png
│     ├─ awards
│     ├─ bat_music.png
│     ├─ bg-home-twilight.png
│     ├─ bg-second-twilight.png
│     ├─ cosplays
│     │  ├─ ada1.jpg
│     │  ├─ ada2.jpg
│     │  ├─ ada_cover.jpg
│     │  ├─ alien1.jpg
│     │  ├─ alien2.jpg
│     │  ├─ alien3.jpg
│     │  ├─ alien4.jpg
│     │  ├─ alien5.jpg
│     │  ├─ alien6.jpg
│     │  ├─ alien7.jpg
│     │  ├─ alien8.jpg
│     │  ├─ alien9.jpg
│     │  ├─ alien_cover.jpg
│     │  ├─ ashley1.jpg
│     │  ├─ ashley2.jpg
│     │  ├─ ashley_cover.jpg
│     │  ├─ bela1.jpg
│     │  ├─ bela2.jpg
│     │  ├─ bela3.jpg
│     │  ├─ bela4.jpg
│     │  ├─ bela5.jpg
│     │  ├─ bela6.jpg
│     │  ├─ bela_cover.jpg
│     │  ├─ choso1.jpg
│     │  ├─ choso2.jpg
│     │  ├─ choso_cover.png
│     │  ├─ emily1.jpg
│     │  ├─ emily2.jpg
│     │  ├─ emily3.jpg
│     │  ├─ emily4.jpg
│     │  ├─ emily5.jpg
│     │  ├─ emily6.jpg
│     │  ├─ emily7.jpg
│     │  ├─ emily_cover.png
│     │  ├─ grace1.jpg
│     │  ├─ grace2.jpg
│     │  ├─ grace_cover.png
│     │  ├─ infected1.jpg
│     │  ├─ infected2.jpg
│     │  ├─ infected3.jpg
│     │  ├─ infected4.jpg
│     │  ├─ infected_cover.png
│     │  ├─ jessica1.jpg
│     │  ├─ jessica2.jpg
│     │  ├─ jessica3.jpg
│     │  ├─ jessica4.jpg
│     │  ├─ jessica_cover.png
│     │  ├─ jinx1.jpg
│     │  ├─ jinx2.jpg
│     │  ├─ jinx3.jpg
│     │  ├─ jinx4.jpg
│     │  ├─ jinx5.jpg
│     │  ├─ jinx6.jpg
│     │  ├─ jinx_cover.png
│     │  ├─ lola1.jpg
│     │  ├─ lola2.jpg
│     │  ├─ lola3.jpg
│     │  ├─ lola4.jpg
│     │  ├─ lola_cover.jpg
│     │  ├─ mileena1.jpg
│     │  ├─ mileena2.jpg
│     │  ├─ mileena3.jpg
│     │  ├─ mileena_cover.png
│     │  ├─ mina1.jpg
│     │  ├─ mina2.jpg
│     │  ├─ mina3.jpg
│     │  ├─ mina4.jpg
│     │  ├─ mina5.jpg
│     │  ├─ mina6.jpg
│     │  ├─ mina7.jpg
│     │  ├─ mina_cover.jpg
│     │  ├─ rize1.jpg
│     │  ├─ rize2.jpg
│     │  ├─ rize3.jpg
│     │  ├─ shizuku1.jpg
│     │  ├─ shizuku2.jpg
│     │  ├─ shizuku3.jpg
│     │  ├─ shizuku4.jpg
│     │  ├─ shizuku5.jpg
│     │  ├─ shizuku_cover.png
│     │  ├─ spirit1.jpg
│     │  ├─ spirit2.jpg
│     │  ├─ spirit3.jpg
│     │  ├─ spirit4.jpg
│     │  ├─ spirit5.jpg
│     │  └─ spirit_cover.jpg
│     ├─ cup_mavis.png
│     ├─ cup_mavis_twilight.png
│     ├─ cup_mavis_twilight1.png
│     ├─ disc3.png
│     ├─ disc8.png
│     ├─ home-logo.png
│     ├─ logo-small.png
│     ├─ ss.png
│     ├─ vampire-daylight.png
│     └─ vampire-twilight.png
├─ README.md
├─ styles
│  ├─ admin-analytics.css
│  ├─ admin-archive.css
│  ├─ admin-cosplays.css
│  ├─ admin-edit-mode.css
│  ├─ admin-feedback.css
│  ├─ admin-login.css
│  ├─ admin-movie-suggestions.css
│  ├─ admin-panel.css
│  ├─ admin-trash.css
│  ├─ admin-users.css
│  ├─ admin.css
│  ├─ archive.css
│  ├─ community-links.css
│  ├─ config-section.css
│  ├─ core.css
│  ├─ effects.css
│  ├─ feedback-form.css
│  ├─ footer.css
│  ├─ home-page.css
│  ├─ merch-section.css
│  ├─ observer-character.css
│  ├─ owl-assistant.css
│  ├─ profile.css
│  ├─ socials-section.css
│  ├─ streams-section.css
│  ├─ toast-custom.css
│  └─ twitch-badges.css
├─ telegram-debug.html
└─ tsconfig.json

```
```
by_owl
├─ AGENTS.md
├─ app
│  ├─ 118n.ts
│  ├─ admin
│  │  ├─ analytics
│  │  │  └─ page.tsx
│  │  ├─ archive
│  │  │  └─ page.tsx
│  │  ├─ cosplay
│  │  │  └─ page.tsx
│  │  ├─ feedback
│  │  │  ├─ page.tsx
│  │  │  └─ trash
│  │  │     └─ page.tsx
│  │  ├─ full-edit
│  │  │  └─ page.tsx
│  │  ├─ movie-suggestions
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  └─ users
│  │     └─ page.tsx
│  ├─ api
│  │  ├─ admin
│  │  │  └─ check
│  │  │     └─ route.ts
│  │  ├─ analytics
│  │  │  └─ route.ts
│  │  ├─ auth
│  │  │  └─ [...nextauth]
│  │  │     └─ route.ts
│  │  ├─ data
│  │  │  ├─ archive
│  │  │  │  └─ route.ts
│  │  │  ├─ bio
│  │  │  │  └─ route.ts
│  │  │  ├─ cosplays
│  │  │  │  └─ route.ts
│  │  │  ├─ pc-config
│  │  │  │  └─ route.ts
│  │  │  └─ socials
│  │  │     └─ route.ts
│  │  ├─ feedback
│  │  │  ├─ delete
│  │  │  │  └─ route.ts
│  │  │  ├─ empty-trash
│  │  │  │  └─ route.ts
│  │  │  ├─ read
│  │  │  │  └─ route.ts
│  │  │  ├─ restore
│  │  │  │  └─ route.ts
│  │  │  ├─ route.ts
│  │  │  └─ trash
│  │  │     └─ route.ts
│  │  ├─ movie-suggestions
│  │  │  └─ route.ts
│  │  ├─ owl-chat
│  │  │  ├─ admin-status
│  │  │  │  └─ route.ts
│  │  │  ├─ refresh-cache
│  │  │  │  └─ route.ts
│  │  │  └─ route.ts
│  │  ├─ streams
│  │  │  └─ route.ts
│  │  ├─ twitch
│  │  │  ├─ route.ts
│  │  │  └─ stats
│  │  │     └─ route.ts
│  │  ├─ twitch-badges
│  │  │  └─ route.ts
│  │  ├─ update-data
│  │  │  └─ route.ts
│  │  ├─ upload
│  │  │  └─ route.ts
│  │  ├─ users
│  │  │  └─ route.ts
│  │  └─ visitor
│  │     └─ route.ts
│  ├─ archive
│  │  └─ page.tsx
│  ├─ clientApp.tsx
│  ├─ components
│  │  ├─ AlienObserver.tsx
│  │  ├─ ArchiveView.tsx
│  │  ├─ ClickEffect.tsx
│  │  ├─ ClientSideComponents.tsx
│  │  ├─ CommunityLinks.tsx
│  │  ├─ ConfigSection.tsx
│  │  ├─ CosplayGallery.tsx
│  │  ├─ ExportAnalytics.tsx
│  │  ├─ FeedbackForm.tsx
│  │  ├─ Footer.tsx
│  │  ├─ HeroSection.tsx
│  │  ├─ ImageSlider.tsx
│  │  ├─ LanguageSwitcher.tsx
│  │  ├─ MerchSection.tsx
│  │  ├─ MovieSuggestionForm.tsx
│  │  ├─ MusicPlayer.tsx
│  │  ├─ NotificationProvider.tsx
│  │  ├─ ObserverCharacter.tsx
│  │  ├─ OwlAssistant.tsx
│  │  ├─ PageTransition.tsx
│  │  ├─ RainSplashes.tsx
│  │  ├─ Scroll.tsx
│  │  ├─ SocialsSection.tsx
│  │  ├─ SoundManager.tsx
│  │  ├─ SoundToggle.tsx
│  │  ├─ SpeechBubble.tsx
│  │  ├─ StreamNotification.tsx
│  │  ├─ StreamsSection.tsx
│  │  ├─ TestNotificationsButton.tsx
│  │  ├─ ThemeSwitcher.tsx
│  │  └─ TwitchStats.tsx
│  ├─ favicon.ico
│  ├─ fonts
│  │  ├─ bleedingcowboysrus.ttf
│  │  ├─ Neuzeit-Antiqua.ttf
│  │  └─ TwilightC-Regular.ttf
│  ├─ layout.tsx
│  ├─ login
│  │  └─ page.tsx
│  ├─ page.tsx
│  ├─ profile
│  │  └─ page.tsx
│  ├─ providers
│  │  ├─ QueryProvider.tsx
│  │  └─ SessionProvider.tsx
│  └─ test-resend
│     └─ route.ts
├─ CLAUDE.md
├─ eslint.config.mjs
├─ hooks
│  ├─ useAdmin.ts
│  ├─ useEditMode.ts
│  ├─ usePermission.ts
│  ├─ useStreamNotifications.ts
│  ├─ useThemeImage.ts
│  └─ useVisitorTracking.ts
├─ ip-limits.json
├─ lib
│  ├─ checkAdmin.ts
│  ├─ ipLimit.ts
│  ├─ prisma.ts
│  ├─ siteParser.ts
│  ├─ streamerData.ts
│  ├─ streamerKnowledge.ts
│  └─ visitorML.ts
├─ locales
│  ├─ en.ts
│  └─ ru.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ dev.db
│  ├─ migrations
│  │  ├─ 20260511200826_init
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  ├─ schema.prisma
│  └─ seed.ts
├─ prisma.config.ts.backup
├─ proxy.ts
├─ proxy.ts.backup
├─ public
│  ├─ audio
│  │  └─ quotes
│  └─ images
│     ├─ arrow_left.png
│     ├─ arrow_right.png
│     ├─ awards
│     ├─ bat_music.png
│     ├─ bg-home-twilight.png
│     ├─ bg-second-twilight.png
│     ├─ cosplays
│     │  ├─ ada1.jpg
│     │  ├─ ada2.jpg
│     │  ├─ ada_cover.jpg
│     │  ├─ alien1.jpg
│     │  ├─ alien2.jpg
│     │  ├─ alien3.jpg
│     │  ├─ alien4.jpg
│     │  ├─ alien5.jpg
│     │  ├─ alien6.jpg
│     │  ├─ alien7.jpg
│     │  ├─ alien8.jpg
│     │  ├─ alien9.jpg
│     │  ├─ alien_cover.jpg
│     │  ├─ ashley1.jpg
│     │  ├─ ashley2.jpg
│     │  ├─ ashley_cover.jpg
│     │  ├─ bela1.jpg
│     │  ├─ bela2.jpg
│     │  ├─ bela3.jpg
│     │  ├─ bela4.jpg
│     │  ├─ bela5.jpg
│     │  ├─ bela6.jpg
│     │  ├─ bela_cover.jpg
│     │  ├─ choso1.jpg
│     │  ├─ choso2.jpg
│     │  ├─ choso_cover.png
│     │  ├─ emily1.jpg
│     │  ├─ emily2.jpg
│     │  ├─ emily3.jpg
│     │  ├─ emily4.jpg
│     │  ├─ emily5.jpg
│     │  ├─ emily6.jpg
│     │  ├─ emily7.jpg
│     │  ├─ emily_cover.png
│     │  ├─ grace1.jpg
│     │  ├─ grace2.jpg
│     │  ├─ grace_cover.png
│     │  ├─ infected1.jpg
│     │  ├─ infected2.jpg
│     │  ├─ infected3.jpg
│     │  ├─ infected4.jpg
│     │  ├─ infected_cover.png
│     │  ├─ jessica1.jpg
│     │  ├─ jessica2.jpg
│     │  ├─ jessica3.jpg
│     │  ├─ jessica4.jpg
│     │  ├─ jessica_cover.png
│     │  ├─ jinx1.jpg
│     │  ├─ jinx2.jpg
│     │  ├─ jinx3.jpg
│     │  ├─ jinx4.jpg
│     │  ├─ jinx5.jpg
│     │  ├─ jinx6.jpg
│     │  ├─ jinx_cover.png
│     │  ├─ lola1.jpg
│     │  ├─ lola2.jpg
│     │  ├─ lola3.jpg
│     │  ├─ lola4.jpg
│     │  ├─ lola_cover.jpg
│     │  ├─ mileena1.jpg
│     │  ├─ mileena2.jpg
│     │  ├─ mileena3.jpg
│     │  ├─ mileena_cover.png
│     │  ├─ mina1.jpg
│     │  ├─ mina2.jpg
│     │  ├─ mina3.jpg
│     │  ├─ mina4.jpg
│     │  ├─ mina5.jpg
│     │  ├─ mina6.jpg
│     │  ├─ mina7.jpg
│     │  ├─ mina_cover.jpg
│     │  ├─ rize1.jpg
│     │  ├─ rize2.jpg
│     │  ├─ rize3.jpg
│     │  ├─ shizuku1.jpg
│     │  ├─ shizuku2.jpg
│     │  ├─ shizuku3.jpg
│     │  ├─ shizuku4.jpg
│     │  ├─ shizuku5.jpg
│     │  ├─ shizuku_cover.png
│     │  ├─ spirit1.jpg
│     │  ├─ spirit2.jpg
│     │  ├─ spirit3.jpg
│     │  ├─ spirit4.jpg
│     │  ├─ spirit5.jpg
│     │  └─ spirit_cover.jpg
│     ├─ cup_mavis.png
│     ├─ cup_mavis_twilight.png
│     ├─ cup_mavis_twilight1.png
│     ├─ disc3.png
│     ├─ disc8.png
│     ├─ home-logo.png
│     ├─ logo-small.png
│     ├─ ss.png
│     ├─ vampire-daylight.png
│     └─ vampire-twilight.png
├─ README.md
├─ styles
│  ├─ admin-analytics.css
│  ├─ admin-archive.css
│  ├─ admin-cosplays.css
│  ├─ admin-edit-mode.css
│  ├─ admin-feedback.css
│  ├─ admin-login.css
│  ├─ admin-movie-suggestions.css
│  ├─ admin-panel.css
│  ├─ admin-trash.css
│  ├─ admin-users.css
│  ├─ admin.css
│  ├─ archive.css
│  ├─ community-links.css
│  ├─ config-section.css
│  ├─ core.css
│  ├─ effects.css
│  ├─ feedback-form.css
│  ├─ footer.css
│  ├─ home-page.css
│  ├─ merch-section.css
│  ├─ observer-character.css
│  ├─ owl-assistant.css
│  ├─ profile.css
│  ├─ socials-section.css
│  ├─ streams-section.css
│  ├─ toast-custom.css
│  └─ twitch-badges.css
├─ telegram-debug.html
└─ tsconfig.json

```
```
by_owl
├─ AGENTS.md
├─ app
│  ├─ 118n.ts
│  ├─ admin
│  │  ├─ analytics
│  │  │  └─ page.tsx
│  │  ├─ archive
│  │  │  └─ page.tsx
│  │  ├─ cosplay
│  │  │  └─ page.tsx
│  │  ├─ feedback
│  │  │  ├─ page.tsx
│  │  │  └─ trash
│  │  │     └─ page.tsx
│  │  ├─ full-edit
│  │  │  └─ page.tsx
│  │  ├─ movie-suggestions
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  └─ users
│  │     └─ page.tsx
│  ├─ api
│  │  ├─ admin
│  │  │  └─ check
│  │  │     └─ route.ts
│  │  ├─ analytics
│  │  │  └─ route.ts
│  │  ├─ auth
│  │  │  └─ [...nextauth]
│  │  │     └─ route.ts
│  │  ├─ data
│  │  │  ├─ archive
│  │  │  │  └─ route.ts
│  │  │  ├─ bio
│  │  │  │  └─ route.ts
│  │  │  ├─ cosplays
│  │  │  │  └─ route.ts
│  │  │  ├─ pc-config
│  │  │  │  └─ route.ts
│  │  │  └─ socials
│  │  │     └─ route.ts
│  │  ├─ feedback
│  │  │  ├─ delete
│  │  │  │  └─ route.ts
│  │  │  ├─ empty-trash
│  │  │  │  └─ route.ts
│  │  │  ├─ read
│  │  │  │  └─ route.ts
│  │  │  ├─ restore
│  │  │  │  └─ route.ts
│  │  │  ├─ route.ts
│  │  │  └─ trash
│  │  │     └─ route.ts
│  │  ├─ movie-suggestions
│  │  │  └─ route.ts
│  │  ├─ owl-chat
│  │  │  ├─ admin-status
│  │  │  │  └─ route.ts
│  │  │  ├─ refresh-cache
│  │  │  │  └─ route.ts
│  │  │  └─ route.ts
│  │  ├─ streams
│  │  │  └─ route.ts
│  │  ├─ twitch
│  │  │  ├─ route.ts
│  │  │  └─ stats
│  │  │     └─ route.ts
│  │  ├─ twitch-badges
│  │  │  └─ route.ts
│  │  ├─ update-data
│  │  │  └─ route.ts
│  │  ├─ upload
│  │  │  └─ route.ts
│  │  ├─ users
│  │  │  └─ route.ts
│  │  └─ visitor
│  │     └─ route.ts
│  ├─ archive
│  │  └─ page.tsx
│  ├─ clientApp.tsx
│  ├─ components
│  │  ├─ AlienObserver.tsx
│  │  ├─ ArchiveView.tsx
│  │  ├─ ClickEffect.tsx
│  │  ├─ ClientSideComponents.tsx
│  │  ├─ CommunityLinks.tsx
│  │  ├─ ConfigSection.tsx
│  │  ├─ CosplayGallery.tsx
│  │  ├─ ExportAnalytics.tsx
│  │  ├─ FeedbackForm.tsx
│  │  ├─ Footer.tsx
│  │  ├─ HeroSection.tsx
│  │  ├─ ImageSlider.tsx
│  │  ├─ LanguageSwitcher.tsx
│  │  ├─ MerchSection.tsx
│  │  ├─ MovieSuggestionForm.tsx
│  │  ├─ MusicPlayer.tsx
│  │  ├─ NotificationProvider.tsx
│  │  ├─ ObserverCharacter.tsx
│  │  ├─ OwlAssistant.tsx
│  │  ├─ PageTransition.tsx
│  │  ├─ RainSplashes.tsx
│  │  ├─ Scroll.tsx
│  │  ├─ SocialsSection.tsx
│  │  ├─ SoundManager.tsx
│  │  ├─ SoundToggle.tsx
│  │  ├─ SpeechBubble.tsx
│  │  ├─ StreamNotification.tsx
│  │  ├─ StreamsSection.tsx
│  │  ├─ TestNotificationsButton.tsx
│  │  ├─ ThemeSwitcher.tsx
│  │  └─ TwitchStats.tsx
│  ├─ favicon.ico
│  ├─ fonts
│  │  ├─ bleedingcowboysrus.ttf
│  │  ├─ Neuzeit-Antiqua.ttf
│  │  └─ TwilightC-Regular.ttf
│  ├─ layout.tsx
│  ├─ login
│  │  └─ page.tsx
│  ├─ page.tsx
│  ├─ profile
│  │  └─ page.tsx
│  ├─ providers
│  │  ├─ QueryProvider.tsx
│  │  └─ SessionProvider.tsx
│  └─ test-resend
│     └─ route.ts
├─ CLAUDE.md
├─ eslint.config.mjs
├─ hooks
│  ├─ useAdmin.ts
│  ├─ useEditMode.ts
│  ├─ usePermission.ts
│  ├─ useStreamNotifications.ts
│  ├─ useThemeImage.ts
│  └─ useVisitorTracking.ts
├─ ip-limits.json
├─ lib
│  ├─ checkAdmin.ts
│  ├─ ipLimit.ts
│  ├─ prisma.ts
│  ├─ siteParser.ts
│  ├─ streamerData.ts
│  ├─ streamerKnowledge.ts
│  └─ visitorML.ts
├─ locales
│  ├─ en.ts
│  └─ ru.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ dev.db
│  ├─ migrations
│  │  ├─ 20260511200826_init
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  ├─ schema.prisma
│  └─ seed.ts
├─ prisma.config.ts.backup
├─ proxy.ts
├─ proxy.ts.backup
├─ public
│  ├─ audio
│  │  └─ quotes
│  └─ images
│     ├─ arrow_left.png
│     ├─ arrow_right.png
│     ├─ awards
│     ├─ bat_music.png
│     ├─ bg-home-twilight.png
│     ├─ bg-second-twilight.png
│     ├─ cosplays
│     │  ├─ ada1.jpg
│     │  ├─ ada2.jpg
│     │  ├─ ada_cover.jpg
│     │  ├─ alien1.jpg
│     │  ├─ alien2.jpg
│     │  ├─ alien3.jpg
│     │  ├─ alien4.jpg
│     │  ├─ alien5.jpg
│     │  ├─ alien6.jpg
│     │  ├─ alien7.jpg
│     │  ├─ alien8.jpg
│     │  ├─ alien9.jpg
│     │  ├─ alien_cover.jpg
│     │  ├─ ashley1.jpg
│     │  ├─ ashley2.jpg
│     │  ├─ ashley_cover.jpg
│     │  ├─ bela1.jpg
│     │  ├─ bela2.jpg
│     │  ├─ bela3.jpg
│     │  ├─ bela4.jpg
│     │  ├─ bela5.jpg
│     │  ├─ bela6.jpg
│     │  ├─ bela_cover.jpg
│     │  ├─ choso1.jpg
│     │  ├─ choso2.jpg
│     │  ├─ choso_cover.png
│     │  ├─ emily1.jpg
│     │  ├─ emily2.jpg
│     │  ├─ emily3.jpg
│     │  ├─ emily4.jpg
│     │  ├─ emily5.jpg
│     │  ├─ emily6.jpg
│     │  ├─ emily7.jpg
│     │  ├─ emily_cover.png
│     │  ├─ grace1.jpg
│     │  ├─ grace2.jpg
│     │  ├─ grace_cover.png
│     │  ├─ infected1.jpg
│     │  ├─ infected2.jpg
│     │  ├─ infected3.jpg
│     │  ├─ infected4.jpg
│     │  ├─ infected_cover.png
│     │  ├─ jessica1.jpg
│     │  ├─ jessica2.jpg
│     │  ├─ jessica3.jpg
│     │  ├─ jessica4.jpg
│     │  ├─ jessica_cover.png
│     │  ├─ jinx1.jpg
│     │  ├─ jinx2.jpg
│     │  ├─ jinx3.jpg
│     │  ├─ jinx4.jpg
│     │  ├─ jinx5.jpg
│     │  ├─ jinx6.jpg
│     │  ├─ jinx_cover.png
│     │  ├─ lola1.jpg
│     │  ├─ lola2.jpg
│     │  ├─ lola3.jpg
│     │  ├─ lola4.jpg
│     │  ├─ lola_cover.jpg
│     │  ├─ mileena1.jpg
│     │  ├─ mileena2.jpg
│     │  ├─ mileena3.jpg
│     │  ├─ mileena_cover.png
│     │  ├─ mina1.jpg
│     │  ├─ mina2.jpg
│     │  ├─ mina3.jpg
│     │  ├─ mina4.jpg
│     │  ├─ mina5.jpg
│     │  ├─ mina6.jpg
│     │  ├─ mina7.jpg
│     │  ├─ mina_cover.jpg
│     │  ├─ rize1.jpg
│     │  ├─ rize2.jpg
│     │  ├─ rize3.jpg
│     │  ├─ shizuku1.jpg
│     │  ├─ shizuku2.jpg
│     │  ├─ shizuku3.jpg
│     │  ├─ shizuku4.jpg
│     │  ├─ shizuku5.jpg
│     │  ├─ shizuku_cover.png
│     │  ├─ spirit1.jpg
│     │  ├─ spirit2.jpg
│     │  ├─ spirit3.jpg
│     │  ├─ spirit4.jpg
│     │  ├─ spirit5.jpg
│     │  └─ spirit_cover.jpg
│     ├─ cup_mavis.png
│     ├─ cup_mavis_twilight.png
│     ├─ cup_mavis_twilight1.png
│     ├─ disc3.png
│     ├─ disc8.png
│     ├─ home-logo.png
│     ├─ logo-small.png
│     ├─ ss.png
│     ├─ vampire-daylight.png
│     └─ vampire-twilight.png
├─ README.md
├─ styles
│  ├─ admin-analytics.css
│  ├─ admin-archive.css
│  ├─ admin-cosplays.css
│  ├─ admin-edit-mode.css
│  ├─ admin-feedback.css
│  ├─ admin-login.css
│  ├─ admin-movie-suggestions.css
│  ├─ admin-panel.css
│  ├─ admin-trash.css
│  ├─ admin-users.css
│  ├─ admin.css
│  ├─ archive.css
│  ├─ community-links.css
│  ├─ config-section.css
│  ├─ core.css
│  ├─ effects.css
│  ├─ feedback-form.css
│  ├─ footer.css
│  ├─ home-page.css
│  ├─ merch-section.css
│  ├─ observer-character.css
│  ├─ owl-assistant.css
│  ├─ profile.css
│  ├─ socials-section.css
│  ├─ streams-section.css
│  ├─ toast-custom.css
│  └─ twitch-badges.css
├─ telegram-debug.html
└─ tsconfig.json

```