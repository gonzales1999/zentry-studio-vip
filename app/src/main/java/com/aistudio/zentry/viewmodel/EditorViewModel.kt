package com.aistudio.zentry.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aistudio.zentry.data.model.*
import com.aistudio.zentry.data.repository.ZentryRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class EditorUiState(
    val currentTimeMs: Long = 0,
    val durationMs: Long = 25000,
    val isPlaying: Boolean = false,
    val playbackSpeed: Float = 1.0f,
    val isMuted: Boolean = false,
    val volume: Float = 1.0f,
    val selectedTab: EditorTab = EditorTab.SUBTITLES,
    val selectedStyle: CaptionStyleId = CaptionStyleId.VIRO_STORYTELLING,
    val hook: HookData = HookData(),
    val brolls: List<BRollItem> = listOf(
        BRollItem("broll_1", "Tecnología & IA", 6600, 3500, BRollTransitionEffect.ZOOM, "EL SECRETO", "RETENCIÓN PURA"),
        BRollItem("broll_2", "Métricas & Crecimiento", 14600, 4200, BRollTransitionEffect.SLIDE, "+500% ALCANCE", "ESTRUCTURA VIRAL")
    ),
    val motions: List<MotionItem> = listOf(
        MotionItem("motion_1", MotionGraphicType.HERO_SPLIT, "ALTA RETENCIÓN", "METODOLOGÍA VIRO", 3300, 3200),
        MotionItem("motion_2", MotionGraphicType.STAT_PUNCH, "+300% SEGUIDORES", "RESULTADO EN 14 DÍAS", 10300, 4000)
    ),
    val activeSfxCount: Int = 8,
    val isExporting: Boolean = false,
    val exportProgress: Float = 0f,
    val exportSuccessMessage: String? = null
)

enum class EditorTab(val label: String, val icon: String) {
    TIMELINE("Timeline", "⏱️"),
    SUBTITLES("Subtítulos", "CC"),
    HOOKS("Hooks", "🪝"),
    BROLL("B-Roll", "▣"),
    MOTION("Motion", "⚡"),
    AUDIO("Audio & SFX", "♫"),
    VIP("VIP Suite", "👑")
}

class EditorViewModel(
    private val repository: ZentryRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(EditorUiState())
    val uiState: StateFlow<EditorUiState> = _uiState.asStateFlow()

    val captions = repository.captionsFlow

    private var playbackJob: Job? = null

    init {
        viewModelScope.launch {
            repository.initializeDefaults()
        }
    }

    fun selectTab(tab: EditorTab) {
        _uiState.value = _uiState.value.copy(selectedTab = tab)
    }

    fun setCaptionStyle(style: CaptionStyleId) {
        _uiState.value = _uiState.value.copy(selectedStyle = style)
        viewModelScope.launch {
            repository.saveProject(
                ProjectDraft(
                    id = "current_project",
                    title = "Video Viral Viro #1",
                    durationMs = _uiState.value.durationMs,
                    selectedStyle = style
                )
            )
        }
    }

    fun togglePlayPause() {
        val current = _uiState.value.isPlaying
        if (current) {
            pause()
        } else {
            play()
        }
    }

    fun play() {
        _uiState.value = _uiState.value.copy(isPlaying = true)
        playbackJob?.cancel()
        playbackJob = viewModelScope.launch {
            val stepMs = 50L
            while (_uiState.value.isPlaying) {
                delay(stepMs)
                val next = _uiState.value.currentTimeMs + (stepMs * _uiState.value.playbackSpeed).toLong()
                if (next >= _uiState.value.durationMs) {
                    _uiState.value = _uiState.value.copy(currentTimeMs = 0, isPlaying = false)
                    break
                } else {
                    _uiState.value = _uiState.value.copy(currentTimeMs = next)
                }
            }
        }
    }

    fun pause() {
        playbackJob?.cancel()
        _uiState.value = _uiState.value.copy(isPlaying = false)
    }

    fun seekTo(timeMs: Long) {
        val clamped = timeMs.coerceIn(0, _uiState.value.durationMs)
        _uiState.value = _uiState.value.copy(currentTimeMs = clamped)
    }

    fun toggleMute() {
        _uiState.value = _uiState.value.copy(isMuted = !_uiState.value.isMuted)
    }

    fun updateHookPreset(preset: HookPresetId) {
        _uiState.value = _uiState.value.copy(
            hook = _uiState.value.hook.copy(presetId = preset)
        )
    }

    fun updateHookTexts(lead: String, main: String) {
        _uiState.value = _uiState.value.copy(
            hook = _uiState.value.hook.copy(leadText = lead, mainText = main)
        )
    }

    fun toggleHookEnabled() {
        val current = _uiState.value.hook.isEnabled
        _uiState.value = _uiState.value.copy(
            hook = _uiState.value.hook.copy(isEnabled = !current)
        )
    }

    fun addBRoll(assetName: String) {
        val currentMs = _uiState.value.currentTimeMs
        val newBRoll = BRollItem(
            id = "broll_${System.currentTimeMillis()}",
            assetName = assetName,
            startMs = currentMs,
            durationMs = 3500,
            transition = BRollTransitionEffect.ZOOM
        )
        _uiState.value = _uiState.value.copy(brolls = _uiState.value.brolls + newBRoll)
    }

    fun removeBRoll(id: String) {
        _uiState.value = _uiState.value.copy(
            brolls = _uiState.value.brolls.filter { it.id != id }
        )
    }

    fun addMotionGraphic(type: MotionGraphicType) {
        val currentMs = _uiState.value.currentTimeMs
        val newMotion = MotionItem(
            id = "motion_${System.currentTimeMillis()}",
            type = type,
            title = type.label.uppercase(),
            subtitle = "ZENTRY DYNAMIC MOTION",
            startMs = currentMs,
            durationMs = 3000
        )
        _uiState.value = _uiState.value.copy(motions = _uiState.value.motions + newMotion)
    }

    fun removeMotion(id: String) {
        _uiState.value = _uiState.value.copy(
            motions = _uiState.value.motions.filter { it.id != id }
        )
    }

    fun triggerExport() {
        if (_uiState.value.isExporting) return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isExporting = true, exportProgress = 0f, exportSuccessMessage = null)
            for (step in 1..10) {
                delay(250)
                _uiState.value = _uiState.value.copy(exportProgress = step / 10f)
            }
            _uiState.value = _uiState.value.copy(
                isExporting = false,
                exportProgress = 1.0f,
                exportSuccessMessage = "¡Video viral 9:16 renderizado en 4K UHD con éxito!"
            )
        }
    }

    fun dismissExportMessage() {
        _uiState.value = _uiState.value.copy(exportSuccessMessage = null)
    }
}
