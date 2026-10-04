package com.aistudio.zentry.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

enum class CaptionStyleId(val title: String, val fontName: String, val badge: String) {
    VIRO_STORYTELLING("Storytelling Pro", "Playfair", "Viro 1"),
    VIRO_MARCA_PERSONAL("Marca Personal", "Montserrat", "Viro 2"),
    VIRO_EDITORIAL("Editorial Aesthetic", "Playfair Italic", "Viro 3"),
    VIRO_HORMOZI("Hormozi Viral", "Anton", "Viro 4"),
    NEON_BEBAS("Neon Impact", "Bebas Neue", "Neon"),
    YELLOW_BOX("Yellow Punch", "Montserrat", "Box"),
    CAPCUT_POP("DynaPuff Pop", "DynaPuff", "CapCut"),
    ELEGANT_SCRIPT("Great Vibes", "Great Vibes", "Script")
}

data class CaptionWord(
    val text: String,
    val startMs: Long,
    val endMs: Long
)

@Entity(tableName = "captions")
data class CaptionItem(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val startMs: Long,
    val endMs: Long,
    val text: String,
    val speaker: String = "Speaker 1"
)

enum class HookPresetId(val label: String, val leadFont: String, val mainFont: String, val accentHex: Long) {
    VIRO_CYAN("Viro Cyan (Esteban)", "Great Vibes", "Montserrat", 0xFF00F5C8),
    EDITORIAL_STORY("Editorial Story", "Playfair Display", "Playfair Display", 0xFF00D4FF),
    IMPACT_STATS("Impacto Stats", "Anton", "Anton", 0xFFFFD700),
    MOTIVACIONAL_3D("Motivacional 3D", "Montserrat", "Montserrat", 0xFF00FF66),
    INSTAGRAM_VIRAL("Instagram Viral", "Anton", "Montserrat", 0xFFFF6B00),
    MINIMAL_TECH("Minimal Tech", "Inter", "Inter", 0xFF00BFFF),
    BOLD_CAPS("Bold Caps", "Montserrat", "Montserrat", 0xFFFFD400)
}

data class HookData(
    val presetId: HookPresetId = HookPresetId.VIRO_CYAN,
    val leadText: String = "Historia",
    val mainText: String = "IMPOSIBLE DE IGNORAR",
    val durationSeconds: Float = 3.2f,
    val isEnabled: Boolean = true
)

enum class BRollTransitionEffect {
    NONE, SLIDE, ZOOM, FLASH
}

data class BRollAsset(
    val id: String,
    val name: String,
    val category: String,
    val placeholderHex: Long
)

data class BRollItem(
    val id: String,
    val assetName: String,
    val startMs: Long,
    val durationMs: Long,
    val transition: BRollTransitionEffect = BRollTransitionEffect.ZOOM,
    val emphasisLead: String = "EL SECRETO",
    val emphasisMain: String = "ESTRATEGIA VISUAL"
)

enum class MotionGraphicType(val label: String, val desc: String) {
    KINETIC_STACK("Kinetic Stack", "Palabras en cascada cinética"),
    HERO_SPLIT("Hero Split", "División de impacto central"),
    EDITORIAL_QUOTE("Editorial Quote", "Cita cinematográfica elegante"),
    STAT_PUNCH("Stat Punch", "Punch de datos y números altos"),
    GRADIENT_TITLE("Gradient Title", "Gradiente de color en movimiento"),
    STEP_SEQUENCE("Step Sequence", "Pasos secuenciales 1, 2, 3")
}

data class MotionItem(
    val id: String,
    val type: MotionGraphicType,
    val title: String,
    val subtitle: String,
    val startMs: Long,
    val durationMs: Long = 3000
)

enum class SfxCategory(val label: String) {
    ALL("Todos"),
    TRANSITIONS("Transiciones"),
    IMPACTS("Impactos"),
    POPS("Clics & Pops"),
    TYPING("Escritura"),
    NOTIFICATIONS("Alertas"),
    VIRAL("Virales")
}

data class SfxEffect(
    val id: String,
    val name: String,
    val category: SfxCategory,
    val durationMs: Long
)

@Entity(tableName = "projects")
data class ProjectDraft(
    @PrimaryKey val id: String = "current_project",
    val title: String = "Video Viral Viro #1",
    val durationMs: Long = 25000,
    val selectedStyle: CaptionStyleId = CaptionStyleId.VIRO_STORYTELLING,
    val videoUri: String? = null,
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "user_profiles")
data class UserProfile(
    @PrimaryKey val id: String,
    val email: String,
    val fullName: String,
    val role: String = "creator",
    val isVip: Boolean = true,
    val credits: Int = 100,
    val createdAt: Long = System.currentTimeMillis()
)
