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
import com.aistudio.zentry.data.model.HookData
import com.aistudio.zentry.data.model.HookPresetId
import com.aistudio.zentry.ui.theme.*

@Composable
fun HooksScreen(
    modifier: Modifier = Modifier,
    hook: HookData,
    onSelectPreset: (HookPresetId) -> Unit,
    onUpdateTexts: (String, String) -> Unit,
    onToggleEnabled: () -> Unit
) {
    var leadText by remember(hook.leadText) { mutableStateOf(hook.leadText) }
    var mainText by remember(hook.mainText) { mutableStateOf(hook.mainText) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(8.dp)
    ) {
        // Switch for Enabling Hook
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(8.dp))
                .background(SurfaceDark)
                .padding(10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "HOOK INICIAL VIRAL",
                    color = Color.White,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Aparece en los primeros 3 segundos",
                    color = TextSecondary,
                    fontSize = 9.sp
                )
            }

            Switch(
                checked = hook.isEnabled,
                onCheckedChange = { onToggleEnabled() },
                colors = SwitchDefaults.colors(
                    checkedThumbColor = Color.White,
                    checkedTrackColor = BrandRed
                )
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Hook Texts Editor
        OutlinedTextField(
            value = leadText,
            onValueChange = {
                leadText = it
                onUpdateTexts(it, mainText)
            },
            label = { Text("Texto Superior (Lead Elegante)", fontSize = 10.sp) },
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = BrandCyan,
                unfocusedBorderColor = BorderDark,
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            )
        )

        Spacer(modifier = Modifier.height(6.dp))

        OutlinedTextField(
            value = mainText,
            onValueChange = {
                mainText = it
                onUpdateTexts(leadText, it)
            },
            label = { Text("Texto Principal (Gancho de Retención)", fontSize = 10.sp) },
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = BrandCyan,
                unfocusedBorderColor = BorderDark,
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            )
        )

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = "PLANTILLAS DE HOOK DISPONIBLES",
            color = BrandGold,
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
        )

        Spacer(modifier = Modifier.height(6.dp))

        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            items(HookPresetId.values()) { preset ->
                val isSelected = preset == hook.presetId
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isSelected) Color(0xFF221515) else SurfaceDark)
                        .border(
                            1.dp,
                            if (isSelected) BrandRed else BorderDark,
                            RoundedCornerShape(8.dp)
                        )
                        .clickable { onSelectPreset(preset) }
                        .padding(8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = preset.label,
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "${preset.leadFont} + ${preset.mainFont}",
                            color = Color(preset.accentHex),
                            fontSize = 9.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }

                    if (isSelected) {
                        Surface(
                            color = BrandRed,
                            shape = RoundedCornerShape(4.dp)
                        ) {
                            Text(
                                text = "ACTIVO",
                                color = Color.White,
                                fontSize = 8.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}
