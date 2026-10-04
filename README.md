# Zentry Studio — Android App (Kotlin & Jetpack Compose)

Zentry Studio is a professional vertical video editor designed for mobile content creators. Rewritten from Next.js to a native modern Android architecture using **Kotlin**, **Jetpack Compose (Material 3)**, and **Room Database**.

---

## 🚀 Core Features

1. **9:16 Vertical Video Canvas**:
   - Real-time preview with safe-zone guides, timeline tracking, and live layers.
   - Word-by-word active highlighting with dynamic styling presets (Viro Storytelling, Marca Personal, Editorial, Hormozi, Neon, Yellow Punch, CapCut, Elegant Script).

2. **Viral Hook Generator**:
   - Initial 3-second hook overlay system.
   - Dual-font typography pairings (e.g. Great Vibes cursive lead + Montserrat bold caps).
   - Presets: Viro Cyan, Editorial Story, Impact Stats, Motivacional 3D, Instagram Viral, Minimal Tech, Bold Caps.

3. **B-Roll Overlay System**:
   - Multi-layer B-Roll video insertion on upper timeline tracks.
   - Transitions: Slide, Zoom, Flash.
   - Built-in B-Roll catalog (Confident, Tech, Ideas, Strategy, Metrics).

4. **Zentry Motion Graphics Engine**:
   - Animated typographic & graphic scenes: Kinetic Stack, Hero Split, Editorial Quote, Stat Punch, Gradient Title, Step Sequence.

5. **Audio & 30+ Sound Effects (SFX)**:
   - Categorized SFX catalog: Transitions (whoosh, risers), Impacts (bass drop 808, vine boom), Pops (bubble pop, cork pop), Typing (keyboard mechanical, typewriter), Notifications (iPhone, Slack chime), Viral (tape stop, vinyl scratch).

6. **VIP Suite & Admin Dashboard**:
   - Local Room database persistence for user profiles, roles, VIP statuses, and credit balances.
   - Real-time search filter and credit grant/deduction actions.

---

## 🛠️ Architecture & Tech Stack

- **UI**: Jetpack Compose, Material 3
- **Language**: Kotlin 2.1.0 (Coroutines & StateFlow)
- **Local Persistence**: Android Room Database (`ZentryDatabase`, `ProjectDao`, `ProfileDao`)
- **Navigation & Lifecycle**: Navigation Compose, ViewModel, Lifecycle Runtime KTX
- **Media**: AndroidX Media3 (ExoPlayer), Coil Compose
- **Build System**: Gradle 8.8.0 Kotlin DSL (`build.gradle.kts`, `settings.gradle.kts`, `libs.versions.toml`)
- **Adaptive Icon**: Adaptive launcher icons configured for all standard densities (`mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`, `anydpi-v26`).

---

## 📱 Application ID & Namespace
- **Application ID**: `com.aistudio.zentry.kxmpzq`
- **Namespace**: `com.aistudio.zentry`
- **Minimum SDK**: 26 (Android 8.0 Oreo)
- **Target SDK**: 35 (Android 15)
