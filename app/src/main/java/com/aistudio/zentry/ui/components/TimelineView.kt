package com.aistudio.zentry.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.Replay
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.zentry.data.model.BRollItem
import com.aistudio.zentry.data.model.CaptionItem
import com.aistudio.zentry.data.model.MotionItem
import com.aistudio.zentry.ui.theme.*

@Composable
fun TimelineView(
    modifier: Modifier = Modifier,
    currentTimeMs: Long,
    durationMs: Long,
    isPlaying: Boolean,
    onTogglePlay: () -> Unit,
    onSeek: (Long) -> Unit,
    captions: List<CaptionItem>,
    brolls: List<BRollItem>,
    motions: List<MotionItem>
) {
    val scrollState = rememberScrollState()
    val timelineWidthDp = 800.dp
    val progress = if (durationMs > 0) currentTimeMs.toFloat() / durationMs else 0f

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(PanelDark)
            .border(1.dp, BorderDark, RoundedCornerShape(10.dp))
            .padding(8.dp)
    ) {
        // Timeline Header: Play controls & Time readouts
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 6.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                IconButton(
                    onClick = onTogglePlay,
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(BrandRed)
                ) {
                    Icon(
                        imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                        contentDescription = "Play/Pause",
                        tint = Color.White,
                        modifier = Modifier.size(18.dp)
                    )
                }

                IconButton(
                    onClick = { onSeek(0) },
                    modifier = Modifier.size(28.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Replay,
                        contentDescription = "Restart",
                        tint = TextSecondary,
                        modifier = Modifier.size(16.dp)
                    )
                }

                Text(
                    text = "${formatTime(currentTimeMs)} / ${formatTime(durationMs)}",
                    color = TextPrimary,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Surface(
                color = Color(0xFF1B1B1B),
                shape = RoundedCornerShape(4.dp),
                border = androidx.compose.foundation.BorderStroke(0.5.dp, BorderDark)
            ) {
                Text(
                    text = "30 FPS · 4K",
                    color = BrandGold,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
            }
        }

        // Multi-Track Container with Horizontal Scroll
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(130.dp)
                .clip(RoundedCornerShape(6.dp))
                .background(Color(0xFF0A0A0A))
                .horizontalScroll(scrollState)
                .pointerInput(durationMs) {
                    detectDragGestures { change, _ ->
                        val x = change.position.x
                        val ratio = (x / size.width).coerceIn(0f, 1f)
                        onSeek((ratio * durationMs).toLong())
                    }
                }
        ) {
            Box(
                modifier = Modifier
                    .width(timelineWidthDp)
                    .fillMaxHeight()
            ) {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(3.dp)
                ) {
                    // Track 1: Captions (Red hue)
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(26.dp)
                            .background(Color(0xFF140D0D))
                    ) {
                        captions.forEach { cap ->
                            val startFrac = cap.startMs.toFloat() / durationMs
                            val durationFrac = (cap.endMs - cap.startMs).toFloat() / durationMs
                            Box(
                                modifier = Modifier
                                    .fillMaxHeight()
                                    .fillMaxWidth(durationFrac)
                                    .offset(x = timelineWidthDp * startFrac)
                                    .padding(vertical = 2.dp, horizontal = 1.dp)
                                    .clip(RoundedCornerShape(3.dp))
                                    .background(Color(0xFF381515))
                                    .border(1.dp, Color(0xFF6E2525), RoundedCornerShape(3.dp))
                                    .clickable { onSeek(cap.startMs) }
                            ) {
                                Text(
                                    text = cap.text,
                                    color = Color(0xFFE9AAA2),
                                    fontSize = 8.sp,
                                    maxLines = 1,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }

                    // Track 2: B-Roll (Cyan/Teal hue)
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(26.dp)
                            .background(Color(0xFF0C1312))
                    ) {
                        brolls.forEach { broll ->
                            val startFrac = broll.startMs.toFloat() / durationMs
                            val durationFrac = broll.durationMs.toFloat() / durationMs
                            Box(
                                modifier = Modifier
                                    .fillMaxHeight()
                                    .fillMaxWidth(durationFrac)
                                    .offset(x = timelineWidthDp * startFrac)
                                    .padding(vertical = 2.dp, horizontal = 1.dp)
                                    .clip(RoundedCornerShape(3.dp))
                                    .background(Color(0xFF10352F))
                                    .border(1.dp, BrandCyan.copy(alpha = 0.6f), RoundedCornerShape(3.dp))
                                    .clickable { onSeek(broll.startMs) }
                            ) {
                                Text(
                                    text = "▣ ${broll.assetName}",
                                    color = BrandCyan,
                                    fontSize = 8.sp,
                                    maxLines = 1,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }

                    // Track 3: Motion Graphics (Orange/Yellow hue)
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(26.dp)
                            .background(Color(0xFF14120C))
                    ) {
                        motions.forEach { motion ->
                            val startFrac = motion.startMs.toFloat() / durationMs
                            val durationFrac = motion.durationMs.toFloat() / durationMs
                            Box(
                                modifier = Modifier
                                    .fillMaxHeight()
                                    .fillMaxWidth(durationFrac)
                                    .offset(x = timelineWidthDp * startFrac)
                                    .padding(vertical = 2.dp, horizontal = 1.dp)
                                    .clip(RoundedCornerShape(3.dp))
                                    .background(Color(0xFF382A0F))
                                    .border(1.dp, BrandYellow.copy(alpha = 0.6f), RoundedCornerShape(3.dp))
                                    .clickable { onSeek(motion.startMs) }
                            ) {
                                Text(
                                    text = "⚡ ${motion.type.label}",
                                    color = BrandYellow,
                                    fontSize = 8.sp,
                                    maxLines = 1,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }

                    // Track 4: Audio Waveform Simulation
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(34.dp)
                            .background(Color(0xFF0F1715))
                            .padding(horizontal = 4.dp, vertical = 6.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxSize(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            for (i in 0..70) {
                                val heightFrac = remember(i) { ((i * 37) % 80 + 20) / 100f }
                                Box(
                                    modifier = Modifier
                                        .width(2.dp)
                                        .fillMaxHeight(heightFrac)
                                        .background(Color(0xFF20D78B).copy(alpha = 0.7f))
                                )
                            }
                        }
                    }
                }

                // Playhead needle
                Box(
                    modifier = Modifier
                        .offset(x = timelineWidthDp * progress)
                        .width(2.dp)
                        .fillMaxHeight()
                        .background(BrandRed)
                ) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .offset(x = (-4).dp, y = (-2).dp)
                            .background(BrandRed, CircleShape)
                    )
                }
            }
        }
    }
}
