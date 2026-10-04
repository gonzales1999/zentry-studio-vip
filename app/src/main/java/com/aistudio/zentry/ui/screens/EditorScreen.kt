package com.aistudio.zentry.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.zentry.data.repository.ZentryRepository
import com.aistudio.zentry.ui.components.TimelineView
import com.aistudio.zentry.ui.components.ToolRail
import com.aistudio.zentry.ui.components.VideoCanvas
import com.aistudio.zentry.ui.theme.*
import com.aistudio.zentry.viewmodel.AdminViewModel
import com.aistudio.zentry.viewmodel.EditorTab
import com.aistudio.zentry.viewmodel.EditorViewModel

@Composable
fun EditorScreen(
    editorViewModel: EditorViewModel,
    adminViewModel: AdminViewModel,
    repository: ZentryRepository,
    modifier: Modifier = Modifier
) {
    val uiState by editorViewModel.uiState.collectAsState()
    val captions by editorViewModel.captions.collectAsState(initial = emptyList())
    val profiles by adminViewModel.profiles.collectAsState()
    val searchQuery by adminViewModel.searchQuery.collectAsState()

    val sfxList = remember { repository.getSfxCatalog() }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = BgDark,
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Surface(
                            color = BrandRed,
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.size(28.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(
                                    text = "Z",
                                    color = Color.White,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Black
                                )
                            }
                        }

                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "ZENTRY ",
                                    color = Color.White,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Black
                                )
                                Text(
                                    text = "STUDIO",
                                    color = BrandRed,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Black
                                )
                            }
                            Text(
                                text = "VIP SUITE ACTIVA",
                                color = BrandGold,
                                fontSize = 7.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp
                            )
                        }
                    }
                },
                actions = {
                    // Credits badge
                    Surface(
                        color = Color(0xFF1C140A),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF4A3414)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(text = "👑 ", fontSize = 10.sp)
                            Text(
                                text = "250 CR",
                                color = BrandGold,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Black
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(6.dp))

                    // Export Button
                    Button(
                        onClick = { editorViewModel.triggerExport() },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = BrandRed
                        ),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                        modifier = Modifier.height(32.dp)
                    ) {
                        Text(
                            text = "⚡ EXPORTAR",
                            color = Color.White,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Black
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = PanelDark
                )
            )
        },
        bottomBar = {
            ToolRail(
                selectedTab = uiState.selectedTab,
                onSelectTab = { editorViewModel.selectTab(it) }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Top Section: 9:16 Canvas Preview
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1.1f)
                    .padding(horizontal = 16.dp, vertical = 6.dp),
                contentAlignment = Alignment.Center
            ) {
                VideoCanvas(
                    currentTimeMs = uiState.currentTimeMs,
                    isPlaying = uiState.isPlaying,
                    onTogglePlay = { editorViewModel.togglePlayPause() },
                    isMuted = uiState.isMuted,
                    onToggleMute = { editorViewModel.toggleMute() },
                    captions = captions,
                    style = uiState.selectedStyle,
                    hook = uiState.hook,
                    brolls = uiState.brolls,
                    motions = uiState.motions
                )
            }

            // Lower Section: Swappable Tab Panels or Timeline
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1.1f)
                    .background(PanelDark)
            ) {
                when (uiState.selectedTab) {
                    EditorTab.TIMELINE -> {
                        TimelineView(
                            currentTimeMs = uiState.currentTimeMs,
                            durationMs = uiState.durationMs,
                            isPlaying = uiState.isPlaying,
                            onTogglePlay = { editorViewModel.togglePlayPause() },
                            onSeek = { editorViewModel.seekTo(it) },
                            captions = captions,
                            brolls = uiState.brolls,
                            motions = uiState.motions
                        )
                    }
                    EditorTab.SUBTITLES -> {
                        SubtitlesScreen(
                            selectedStyle = uiState.selectedStyle,
                            onSelectStyle = { editorViewModel.setCaptionStyle(it) },
                            captions = captions,
                            onSeek = { editorViewModel.seekTo(it) }
                        )
                    }
                    EditorTab.HOOKS -> {
                        HooksScreen(
                            hook = uiState.hook,
                            onSelectPreset = { editorViewModel.updateHookPreset(it) },
                            onUpdateTexts = { lead, main -> editorViewModel.updateHookTexts(lead, main) },
                            onToggleEnabled = { editorViewModel.toggleHookEnabled() }
                        )
                    }
                    EditorTab.BROLL -> {
                        BRollScreen(
                            brolls = uiState.brolls,
                            onAddBRoll = { editorViewModel.addBRoll(it) },
                            onRemoveBRoll = { editorViewModel.removeBRoll(it) },
                            onSeek = { editorViewModel.seekTo(it) }
                        )
                    }
                    EditorTab.MOTION -> {
                        MotionGraphicsScreen(
                            motions = uiState.motions,
                            onAddMotion = { editorViewModel.addMotionGraphic(it) },
                            onRemoveMotion = { editorViewModel.removeMotion(it) },
                            onSeek = { editorViewModel.seekTo(it) }
                        )
                    }
                    EditorTab.AUDIO -> {
                        AudioSfxScreen(
                            sfxList = sfxList,
                            onPreviewSfx = { /* audio preview */ }
                        )
                    }
                    EditorTab.VIP -> {
                        AdminScreen(
                            profiles = profiles,
                            searchQuery = searchQuery,
                            onSearchChange = { adminViewModel.setSearchQuery(it) },
                            onToggleVip = { id, vip -> adminViewModel.toggleVip(id, vip) },
                            onAdjustCredits = { id, cr, delta -> adminViewModel.adjustCredits(id, cr, delta) }
                        )
                    }
                }
            }
        }

        // Export Dialog / Progress Overlay
        if (uiState.isExporting || uiState.exportSuccessMessage != null) {
            AlertDialog(
                onDismissRequest = {
                    if (!uiState.isExporting) editorViewModel.dismissExportMessage()
                },
                title = {
                    Text(
                        text = if (uiState.isExporting) "RENDERIZANDO VIDEO VIRAL" else "¡RENDER COMPLETADO!",
                        color = if (uiState.isExporting) BrandRed else BrandMint,
                        fontWeight = FontWeight.Black,
                        fontSize = 16.sp
                    )
                },
                text = {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        if (uiState.isExporting) {
                            Text(
                                text = "Procesando B-Roll, Motion Graphics y Subtítulos a 60 FPS...",
                                color = TextSecondary,
                                fontSize = 11.sp
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            LinearProgressIndicator(
                                progress = { uiState.exportProgress },
                                color = BrandRed,
                                trackColor = SurfaceDark,
                                modifier = Modifier.fillMaxWidth()
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "${(uiState.exportProgress * 100).toInt()}%",
                                color = Color.White,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        } else {
                            Text(
                                text = uiState.exportSuccessMessage ?: "",
                                color = Color.White,
                                fontSize = 12.sp
                            )
                        }
                    }
                },
                confirmButton = {
                    if (!uiState.isExporting) {
                        Button(
                            onClick = { editorViewModel.dismissExportMessage() },
                            colors = ButtonDefaults.buttonColors(containerColor = BrandRed)
                        ) {
                            Text("Aceptar")
                        }
                    }
                },
                containerColor = Color(0xFF141010)
            )
        }
    }
}
