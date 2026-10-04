package com.aistudio.zentry.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.VolumeMute
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.zentry.data.model.*
import com.aistudio.zentry.ui.theme.*

@Composable
fun VideoCanvas(
    modifier: Modifier = Modifier,
    currentTimeMs: Long,
    isPlaying: Boolean,
    onTogglePlay: () -> Unit,
    isMuted: Boolean,
    onToggleMute: () -> Unit,
    captions: List<CaptionItem>,
    style: CaptionStyleId,
    hook: HookData,
    brolls: List<BRollItem>,
    motions: List<MotionItem>
) {
    // Current active caption
    val activeCaption = captions.find { currentTimeMs in it.startMs..it.endMs }

    // Active hook
    val isHookActive = hook.isEnabled && currentTimeMs < (hook.durationSeconds * 1000).toLong()

    // Active B-roll
    val activeBroll = brolls.find { currentTimeMs in it.startMs..(it.startMs + it.durationMs) }

    // Active Motion graphic
    val activeMotion = motions.find { currentTimeMs in it.startMs..(it.startMs + it.durationMs) }

    // Subtle background pulse animation
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val glowAlpha by infiniteTransition.animateFloat(
        initialValue = 0.15f,
        targetValue = 0.35f,
        animationSpec = infiniteRepeatable(
            animation = tween(1400, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "glow"
    )

    Box(
        modifier = modifier
            .aspectRatio(9f / 16f)
            .clip(RoundedCornerShape(14.dp))
            .background(BgDark)
            .border(1.dp, BorderDark, RoundedCornerShape(14.dp))
            .shadow(16.dp, RoundedCornerShape(14.dp)),
        contentAlignment = Alignment.Center
    ) {
        // 1. Base Layer (Cinematic Video Simulation with Glow & Silhouette)
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.radialGradient(
                        colors = listOf(
                            Color(0xFF220A0A).copy(alpha = glowAlpha),
                            Color(0xFF0F0B0B),
                            BgDark
                        )
                    )
                )
        ) {
            // Safe zone guideline
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 20.dp, vertical = 32.dp)
                    .border(0.5.dp, Color(0x22FFFFFF), RoundedCornerShape(8.dp))
            )

            // Top Status Bar in Canvas
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    color = Color(0xBB000000),
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Text(
                        text = "9:16 VERTICAL 4K",
                        color = BrandGold,
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }

                Surface(
                    color = Color(0xBB000000),
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Text(
                        text = formatTime(currentTimeMs),
                        color = Color.White,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }
        }

        // 2. B-Roll Overlay Layer
        AnimatedVisibility(
            visible = activeBroll != null,
            enter = fadeIn(tween(180)),
            exit = fadeOut(tween(180))
        ) {
            if (activeBroll != null) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(Color(0xE0140A0A), Color(0xFA090909))
                            )
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Surface(
                            color = Color(0x4400F5C8),
                            border = androidx.compose.foundation.BorderStroke(1.dp, BrandCyan),
                            shape = RoundedCornerShape(4.dp)
                        ) {
                            Text(
                                text = "B-ROLL: ${activeBroll.assetName.uppercase()}",
                                color = BrandCyan,
                                fontSize = 8.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = activeBroll.emphasisLead,
                            color = Color.White.copy(alpha = 0.9f),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )

                        Text(
                            text = activeBroll.emphasisMain,
                            color = BrandCyan,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Black,
                            textAlign = TextAlign.Center,
                            lineHeight = 26.sp
                        )
                    }
                }
            }
        }

        // 3. Motion Graphics Layer
        AnimatedVisibility(
            visible = activeMotion != null && activeBroll == null,
            enter = fadeIn(tween(180)),
            exit = fadeOut(tween(180))
        ) {
            if (activeMotion != null) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Surface(
                        color = Color(0xEE121212),
                        border = androidx.compose.foundation.BorderStroke(1.5.dp, BrandRed),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.padding(16.dp)
                        ) {
                            Text(
                                text = activeMotion.subtitle,
                                color = BrandRed,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.ExtraBold,
                                letterSpacing = 1.5.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = activeMotion.title,
                                color = Color.White,
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Black,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
            }
        }

        // 4. Hook Overlay Layer (Top priority in first few seconds)
        AnimatedVisibility(
            visible = isHookActive,
            enter = fadeIn(tween(200)),
            exit = fadeOut(tween(200))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp, vertical = 60.dp),
                contentAlignment = Alignment.TopCenter
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = hook.leadText,
                        color = Color.White,
                        fontSize = 18.sp,
                        fontStyle = FontStyle.Italic,
                        fontWeight = FontWeight.SemiBold,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(2.dp))

                    Text(
                        text = hook.mainText,
                        color = Color(hook.presetId.accentHex),
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Black,
                        textAlign = TextAlign.Center,
                        lineHeight = 28.sp
                    )
                }
            }
        }

        // 5. Dynamic Captions Layer
        if (!isHookActive && activeCaption != null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp, vertical = 70.dp),
                contentAlignment = Alignment.BottomCenter
            ) {
                CaptionDisplay(caption = activeCaption, style = style)
            }
        }

        // Play/Pause Center Indicator on Tap
        Box(
            modifier = Modifier
                .fillMaxSize()
                .clickable { onTogglePlay() },
            contentAlignment = Alignment.Center
        ) {
            if (!isPlaying) {
                Surface(
                    color = Color(0xCC000000),
                    shape = CircleShape,
                    modifier = Modifier.size(52.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = "Play",
                        tint = Color.White,
                        modifier = Modifier
                            .padding(12.dp)
                            .size(28.dp)
                    )
                }
            }
        }

        // Bottom Controls Pill Inside Canvas
        Row(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(8.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Surface(
                color = Color(0x99000000),
                shape = CircleShape,
                modifier = Modifier
                    .size(28.dp)
                    .clickable { onToggleMute() }
            ) {
                Icon(
                    imageVector = if (isMuted) Icons.Default.VolumeMute else Icons.Default.VolumeUp,
                    contentDescription = "Mute Toggle",
                    tint = if (isMuted) BrandRed else Color.White,
                    modifier = Modifier.padding(6.dp)
                )
            }
        }
    }
}

@Composable
fun CaptionDisplay(caption: CaptionItem, style: CaptionStyleId) {
    val words = caption.text.split(" ")
    val middleIdx = words.size / 2

    when (style) {
        CaptionStyleId.VIRO_STORYTELLING -> {
            Text(
                text = caption.text.uppercase(),
                color = Color.White,
                fontSize = 19.sp,
                fontWeight = FontWeight.Black,
                textAlign = TextAlign.Center,
                lineHeight = 23.sp
            )
        }
        CaptionStyleId.VIRO_MARCA_PERSONAL -> {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                words.forEachIndexed { idx, word ->
                    val isAccent = idx == middleIdx
                    Text(
                        text = "$word ",
                        color = if (isAccent) BrandCyan else Color.White,
                        fontSize = if (isAccent) 22.sp else 18.sp,
                        fontWeight = FontWeight.Black
                    )
                }
            }
        }
        CaptionStyleId.YELLOW_BOX -> {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                words.forEachIndexed { idx, word ->
                    if (idx == middleIdx) {
                        Surface(
                            color = BrandYellow,
                            shape = RoundedCornerShape(3.dp),
                            modifier = Modifier.padding(horizontal = 2.dp)
                        ) {
                            Text(
                                text = " $word ",
                                color = Color.Black,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black
                            )
                        }
                    } else {
                        Text(
                            text = "$word ",
                            color = Color.White,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
        CaptionStyleId.NEON_BEBAS -> {
            Text(
                text = caption.text.uppercase(),
                color = BrandMint,
                fontSize = 21.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 1.sp,
                textAlign = TextAlign.Center
            )
        }
        else -> {
            Text(
                text = caption.text,
                color = Color.White,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
        }
    }
}

fun formatTime(timeMs: Long): String {
    val totalSeconds = timeMs / 1000
    val minutes = totalSeconds / 60
    val seconds = totalSeconds % 60
    val millis = (timeMs % 1000) / 100
    return String.format("%02d:%02d.%d", minutes, seconds, millis)
}
