package com.aistudio.zentry.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.zentry.data.model.CaptionItem
import com.aistudio.zentry.data.model.CaptionStyleId
import com.aistudio.zentry.ui.components.formatTime
import com.aistudio.zentry.ui.theme.*

@Composable
fun SubtitlesScreen(
    modifier: Modifier = Modifier,
    selectedStyle: CaptionStyleId,
    onSelectStyle: (CaptionStyleId) -> Unit,
    captions: List<CaptionItem>,
    onSeek: (Long) -> Unit
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(8.dp)
    ) {
        Text(
            text = "ESTILO ACTIVO DE SUBTÍTULOS",
            color = BrandRed,
            fontSize = 9.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = 1.sp
        )

        Spacer(modifier = Modifier.height(6.dp))

        // Grid of Preset Styles
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            CaptionStyleId.values().take(4).forEach { style ->
                val isSelected = style == selectedStyle
                Surface(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onSelectStyle(style) },
                    color = if (isSelected) Color(0xFF281111) else SurfaceDark,
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (isSelected) BrandRed else BorderDark
                    ),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(6.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = style.badge,
                            color = if (isSelected) BrandRed else BrandGold,
                            fontSize = 8.sp,
                            fontWeight = FontWeight.ExtraBold
                        )
                        Text(
                            text = style.title,
                            color = if (isSelected) Color.White else TextSecondary,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            maxLines = 1
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = "LÍNEAS DE TRANSCRIPCIÓN (${captions.size})",
            color = TextSecondary,
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.5.sp
        )

        Spacer(modifier = Modifier.height(6.dp))

        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            items(captions) { item ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(SurfaceDark)
                        .border(1.dp, BorderDark, RoundedCornerShape(8.dp))
                        .clickable { onSeek(item.startMs) }
                        .padding(8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "${formatTime(item.startMs)} - ${formatTime(item.endMs)}",
                            color = BrandCyan,
                            fontSize = 8.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = item.text,
                            color = TextPrimary,
                            fontSize = 11.sp,
                            lineHeight = 15.sp
                        )
                    }

                    Text(
                        text = "▶",
                        color = TextSecondary,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(start = 6.dp)
                    )
                }
            }
        }
    }
}
