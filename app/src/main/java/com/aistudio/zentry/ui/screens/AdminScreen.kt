package com.aistudio.zentry.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.zentry.data.model.UserProfile
import com.aistudio.zentry.ui.theme.*

@Composable
fun AdminScreen(
    modifier: Modifier = Modifier,
    profiles: List<UserProfile>,
    searchQuery: String,
    onSearchChange: (String) -> Unit,
    onToggleVip: (String, Boolean) -> Unit,
    onAdjustCredits: (String, Int, Int) -> Unit
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(8.dp)
    ) {
        // VIP Banner
        Surface(
            color = Color(0xFF1D170F),
            border = androidx.compose.foundation.BorderStroke(1.dp, BrandGold),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Star,
                    contentDescription = "VIP Suite",
                    tint = BrandGold,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(
                        text = "PANEL DE CONTROL VIP SUITE",
                        color = BrandGold,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black
                    )
                    Text(
                        text = "Gestión de roles, membresías VIP y saldo de créditos",
                        color = TextSecondary,
                        fontSize = 8.sp
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Search Bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = onSearchChange,
            leadingIcon = {
                Icon(Icons.Default.Search, contentDescription = "Search", tint = TextSecondary)
            },
            placeholder = { Text("Buscar usuario por nombre o email...", fontSize = 10.sp) },
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = BrandGold,
                unfocusedBorderColor = BorderDark,
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            )
        )

        Spacer(modifier = Modifier.height(10.dp))

        Text(
            text = "USUARIOS REGISTRADOS (${profiles.size})",
            color = TextSecondary,
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(6.dp))

        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            items(profiles) { profile ->
                Surface(
                    color = SurfaceDark,
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (profile.isVip) Color(0xFF4A381D) else BorderDark
                    ),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = profile.fullName,
                                        color = Color.White,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    if (profile.isVip) {
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Surface(
                                            color = BrandGold,
                                            shape = RoundedCornerShape(3.dp)
                                        ) {
                                            Text(
                                                text = "VIP",
                                                color = Color.Black,
                                                fontSize = 7.sp,
                                                fontWeight = FontWeight.Black,
                                                modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                            )
                                        }
                                    }
                                }
                                Text(
                                    text = profile.email,
                                    color = TextSecondary,
                                    fontSize = 9.sp
                                )
                            }

                            // VIP Switch
                            Switch(
                                checked = profile.isVip,
                                onCheckedChange = { onToggleVip(profile.id, profile.isVip) },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.Black,
                                    checkedTrackColor = BrandGold
                                )
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Credits adjustment row
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Créditos: ${profile.credits}",
                                color = BrandGold,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )

                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Button(
                                    onClick = { onAdjustCredits(profile.id, profile.credits, -10) },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF261212)),
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                    modifier = Modifier.height(28.dp)
                                ) {
                                    Icon(Icons.Default.Remove, contentDescription = "-10", tint = BrandRed, modifier = Modifier.size(12.dp))
                                    Text("-10", color = BrandRed, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                                }

                                Button(
                                    onClick = { onAdjustCredits(profile.id, profile.credits, 25) },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF142921)),
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                    modifier = Modifier.height(28.dp)
                                ) {
                                    Icon(Icons.Default.Add, contentDescription = "+25", tint = BrandMint, modifier = Modifier.size(12.dp))
                                    Text("+25", color = BrandMint, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
