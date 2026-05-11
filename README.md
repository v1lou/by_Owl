
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
│  │  │  ├─ page.tsx
│  │  │  └─ reorder
│  │  │     └─ route.ts
│  │  ├─ feedback
│  │  │  ├─ page.tsx
│  │  │  └─ trash
│  │  │     └─ page.tsx
│  │  ├─ full-edit
│  │  │  └─ page.tsx
│  │  ├─ movie-suggestions
│  │  │  └─ page.tsx
│  │  └─ page.tsx
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
│  │  └─ visitor
│  │     └─ route.ts
│  ├─ archive
│  │  └─ page.tsx
│  ├─ clientApp.tsx
│  ├─ components
│  │  ├─ AlienObserver.tsx
│  │  ├─ ArchiveView.tsx
│  │  ├─ BloodDrawEffect.tsx
│  │  ├─ ClientSideComponents.tsx
│  │  ├─ CommunityLinks.tsx
│  │  ├─ ConfigSection.tsx
│  │  ├─ ExportAnalytics.tsx
│  │  ├─ FeedbackForm.tsx
│  │  ├─ FloatingCharacter.tsx
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
│  │  ├─ Scroll.tsx
│  │  ├─ SocialsSection.tsx
│  │  ├─ SoundManager.tsx
│  │  ├─ SoundToggle.tsx
│  │  ├─ SpeechBubble.tsx
│  │  ├─ StreamsSection.tsx
│  │  ├─ TestNotificationsButton.tsx
│  │  ├─ ThemeSwitcher.tsx
│  │  └─ TwitchStats.tsx
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
├─ pnpm-lock.yaml
├─ postcss.config.mjs
├─ prisma
│  ├─ dev.db
│  ├─ migrations
│  │  ├─ 20260409164708_init
│  │  │  └─ migration.sql
│  │  ├─ 20260409184939_init
│  │  │  └─ migration.sql
│  │  ├─ 20260416214124_add_feedback
│  │  │  └─ migration.sql
│  │  ├─ 20260419014255_add_streams
│  │  │  └─ migration.sql
│  │  ├─ 20260419020755_add_has_vod
│  │  │  └─ migration.sql
│  │  ├─ 20260419214003_add_trash
│  │  │  └─ migration.sql
│  │  ├─ 20260419215129_add_deleted_at
│  │  │  └─ migration.sql
│  │  ├─ 20260419224822_add_visitor
│  │  │  └─ migration.sql
│  │  ├─ 20260420113739_add_ml_features
│  │  │  └─ migration.sql
│  │  ├─ 20260421012116_add_owl_models
│  │  │  └─ migration.sql
│  │  ├─ 20260424181512_add_movie_suggestions
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
│     ├─ home_logo.png
│     ├─ music_disc.png
│     ├─ ss.png
│     ├─ vampire_daylight.png
│     └─ vampire_twilight.png
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
│  ├─ admin.css
│  ├─ archive.css
│  ├─ community-links.css
│  ├─ config-section.css
│  ├─ core.css
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