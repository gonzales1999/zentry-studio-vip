package com.aistudio.zentry.data.repository

import com.aistudio.zentry.data.local.ProfileDao
import com.aistudio.zentry.data.local.ProjectDao
import com.aistudio.zentry.data.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull

class ZentryRepository(
    private val projectDao: ProjectDao,
    private val profileDao: ProfileDao
) {
    val projectFlow: Flow<ProjectDraft?> = projectDao.getProjectById("current_project")
    val captionsFlow: Flow<List<CaptionItem>> = projectDao.getAllCaptions()
    val profilesFlow: Flow<List<UserProfile>> = profileDao.getAllProfiles()

    suspend fun initializeDefaults() {
        val current = projectFlow.firstOrNull()
        if (current == null) {
            projectDao.saveProject(
                ProjectDraft(
                    id = "current_project",
                    title = "Video Viral Viro #1",
                    durationMs = 28000,
                    selectedStyle = CaptionStyleId.VIRO_STORYTELLING
                )
            )
        }

        val captions = captionsFlow.firstOrNull()
        if (captions.isNullOrEmpty()) {
            projectDao.insertCaptions(
                listOf(
                    CaptionItem(startMs = 0, endMs = 3200, text = "Esta es la regla número uno que nadie te cuenta."),
                    CaptionItem(startMs = 3300, endMs = 6500, text = "El 99% de creadores falla exactamente en este punto."),
                    CaptionItem(startMs = 6600, endMs = 10200, text = "Si cambias la estructura de tu hook en los primeros 3 segundos..."),
                    CaptionItem(startMs = 10300, endMs = 14500, text = "Tu retención de audiencia se multiplica de inmediato."),
                    CaptionItem(startMs = 14600, endMs = 18800, text = "Mira cómo los motion graphics y el B-roll refuerzan el mensaje."),
                    CaptionItem(startMs = 18900, endMs = 24000, text = "Guarda este video y ponlo a prueba hoy mismo.")
                )
            )
        }

        val profiles = profilesFlow.firstOrNull()
        if (profiles.isNullOrEmpty()) {
            profileDao.insertProfiles(
                listOf(
                    UserProfile(id = "user_1", email = "gonzales1999.pan@gmail.com", fullName = "Esteban Gonzales", role = "admin", isVip = true, credits = 250),
                    UserProfile(id = "user_2", email = "creator.vip@zentry.ai", fullName = "Viral Creator Pro", role = "creator", isVip = true, credits = 120),
                    UserProfile(id = "user_3", email = "starter.media@gmail.com", fullName = "Ana Content", role = "creator", isVip = false, credits = 15)
                )
            )
        }
    }

    suspend fun saveProject(project: ProjectDraft) = projectDao.saveProject(project)

    suspend fun updateCaption(caption: CaptionItem) = projectDao.updateCaption(caption)

    suspend fun updateCredits(userId: String, credits: Int) = profileDao.updateCredits(userId, credits)

    suspend fun setVipStatus(userId: String, isVip: Boolean) = profileDao.setVipStatus(userId, isVip)

    fun getSfxCatalog(): List<SfxEffect> {
        return listOf(
            SfxEffect("sfx_whoosh_fast", "Whoosh Rápido", SfxCategory.TRANSITIONS, 400),
            SfxEffect("sfx_whoosh_cinematic", "Whoosh Cinemático", SfxCategory.TRANSITIONS, 700),
            SfxEffect("sfx_swish_short", "Swish Corto", SfxCategory.TRANSITIONS, 350),
            SfxEffect("sfx_deep_riser", "Deep Riser", SfxCategory.TRANSITIONS, 1500),
            SfxEffect("sfx_rising_swoosh", "Rising Swoosh", SfxCategory.TRANSITIONS, 900),
            SfxEffect("sfx_bass_drop", "Bass Drop 808", SfxCategory.IMPACTS, 1200),
            SfxEffect("sfx_vine_boom", "Vine Boom", SfxCategory.IMPACTS, 800),
            SfxEffect("sfx_cinematic_thud", "Impacto Thud", SfxCategory.IMPACTS, 600),
            SfxEffect("sfx_metal_hit", "Golpe Metálico", SfxCategory.IMPACTS, 500),
            SfxEffect("sfx_bubble_pop", "Pop Burbuja", SfxCategory.POPS, 250),
            SfxEffect("sfx_cork_pop", "Pop Corcho", SfxCategory.POPS, 300),
            SfxEffect("sfx_mouse_click", "Clic Ratón", SfxCategory.POPS, 150),
            SfxEffect("sfx_ui_tap", "Toque UI", SfxCategory.POPS, 120),
            SfxEffect("sfx_camera_shutter", "Obturador Cámara", SfxCategory.POPS, 400),
            SfxEffect("sfx_typewriter", "Teclado CapCut", SfxCategory.TYPING, 800),
            SfxEffect("sfx_keyboard", "Teclado Mecánico", SfxCategory.TYPING, 600),
            SfxEffect("sfx_iphone_notif", "Notificación iPhone", SfxCategory.NOTIFICATIONS, 500),
            SfxEffect("sfx_slack_chime", "Campana Slack", SfxCategory.NOTIFICATIONS, 600),
            SfxEffect("sfx_bell_ding", "Ding Alerta", SfxCategory.NOTIFICATIONS, 450),
            SfxEffect("sfx_cash", "Dinero Cha-Ching", SfxCategory.VIRAL, 700),
            SfxEffect("sfx_coin", "Moneda Coin", SfxCategory.VIRAL, 500),
            SfxEffect("sfx_tape_stop", "Freno de Cinta", SfxCategory.VIRAL, 600),
            SfxEffect("sfx_record_scratch", "Scratch Vinilo", SfxCategory.VIRAL, 650),
            SfxEffect("sfx_glitch", "Glitch Estático", SfxCategory.VIRAL, 400)
        )
    }

    fun getBRollCatalog(): List<BRollAsset> {
        return listOf(
            BRollAsset("broll_confident", "Confianza & Éxito", "Emoción", 0xFF2A1515),
            BRollAsset("broll_tech", "Tecnología & IA", "Digital", 0xFF122220),
            BRollAsset("broll_ideas", "Lluvia de Ideas", "Creatividad", 0xFF2A2012),
            BRollAsset("broll_strategy", "Estrategia & Plan", "Negocios", 0xFF15182A),
            BRollAsset("broll_data", "Métricas & Crecimiento", "Resultados", 0xFF1F122A)
        )
    }
}
