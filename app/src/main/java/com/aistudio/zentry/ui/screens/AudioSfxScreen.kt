package com.aistudio.zentry.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
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
import com.aistudio.zentry.data.model.SfxCategory
import com.aistudio.zentry.data.model.SfxEffect
import com.aistudio.zentry.ui.theme.*

@Composable
fun AudioSfxScreen(
    modifier: Modifier = Modifier,
    sfxList: List<SfxEffect>,
    onPreviewSfx: (SfxEffect) -> Unit
) {
    var selectedCategory by remember { mutableStateOf(SfxCategory.ALL) }
    var previewingSfxId by remember { mutableStateOf<String?>(null) }

    val filteredList = remember(selectedCategory, sfxList) {
        if (selectedCategory == SfxCategory.ALL) sfxList
        else sfxList.filter { it.category == selectedCategory }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(8.dp)
    ) {
        Text(
            text = "CATÁLOGO DE EFECTOS DE SONIDO VIRALES (30+ SFX)",
            color = BrandMint,
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
        )

        Spacer(modifier = Modifier.height(6.dp))

        // Categories chip row
        val scrollState = rememberScrollState()
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(scrollState),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            SfxCategory.values().forEach { cat ->
                val isSelected = cat == selectedCategory
                Surface(
                    modifier = Modifier.clickable { selectedCategory = cat },
                    color = if (isSelected) Color(0xFF133830) else SurfaceDark,
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (isSelected) BrandMint else BorderDark
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = cat.label,
                        color = if (isSelected) BrandMint else TextSecondary,
                        fontSize = 9.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Grid of Sound Effects
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            modifier = Modifier.weight(1f),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            items(filteredList) { effect ->
                val isPlayingThis = previewingSfxId == effect.id
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isPlayingThis) Color(0xFF221111) else SurfaceDark)
                        .border(
                            1.dp,
                            if (isPlayingThis) BrandRed else BorderDark,
                            RoundedCornerShape(8.dp)
                        )
                        .clickable {
                            previewingSfxId = effect.id
                            onPreviewSfx(effect)
                        }
                        .padding(8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = effect.name,
                            color = Color.White,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            maxLines = 1
                        )
                        Text(
                            text = "${effect.category.label} · ${effect.durationMs}ms",
                            color = TextSecondary,
                            fontSize = 7.sp
                        )
                    }

                    Text(
                        text = if (isPlayingThis) "🔊" else "♫",
                        fontSize = 11.sp
                    )
                }
            }
        }
    }
}
